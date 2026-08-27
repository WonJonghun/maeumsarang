package com.example.mshintra.foodMenu.service;

import com.example.mshintra.foodMenu.dto.*;
import com.example.mshintra.foodMenu.mapper.MealAutoToolMapper;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

@RequiredArgsConstructor
@Service
public class MealAutoToolService {

    private final MealAutoToolMapper mealAutoToolMapper;

    //메뉴 재료/태그 조회
    @Transactional(readOnly = true)
    public List<MealRecipeTagDto> selectRecipeTagList(String reCode) {
        return mealAutoToolMapper.selectRecipeTagList(reCode);
    }

    //메뉴 분석
    @Transactional(readOnly = true)
    public MealRecipeAnalysisDto selectRecipeAnalysis(String reCode) {
        return analyzeRecipe(mealAutoToolMapper.selectRecipeTagList(reCode));
    }

    //전체 메뉴 분석
    @Transactional(readOnly = true)
    public List<MealRecipeAnalysisDto> selectRecipeAnalysisList() {
        List<MealRecipeTagDto> list = mealAutoToolMapper.selectRecipeTagAllList();

        Map<String, List<MealRecipeTagDto>> recipeMap = new LinkedHashMap<>();

        for (MealRecipeTagDto item : list) {
            recipeMap.computeIfAbsent(
                    item.getReCode(),
                    key -> new ArrayList<>()
            ).add(item);
        }

        List<MealRecipeAnalysisDto> result = new ArrayList<>();

        for (List<MealRecipeTagDto> recipeList : recipeMap.values()) {
            MealRecipeAnalysisDto recipe = analyzeRecipe(recipeList);

            if (recipe != null) {
                result.add(recipe);
            }
        }

        return result;
    }

    //메뉴 종류별 후보 Pool
    @Transactional(readOnly = true)
    public Map<Integer, List<MealRecipeAnalysisDto>> selectRecipePool() {
        List<MealRecipeAnalysisDto> list = selectRecipeAnalysisList();

        Map<Integer, List<MealRecipeAnalysisDto>> result = new LinkedHashMap<>();

        for (MealRecipeAnalysisDto item : list) {
            result.computeIfAbsent(
                    item.getReFlag(),
                    key -> new ArrayList<>()
            ).add(item);
        }

        return result;
    }

    //주간 식단 생성
    @Transactional(readOnly = true)
    public WeeklyMealPlanDto createWeeklyMealPlan(LocalDate startDate) {
        Map<Integer, List<MealRecipeAnalysisDto>> recipePool = selectRecipePool();

        Set<String> breakfastRecipeCodes =
                new HashSet<>(mealAutoToolMapper.selectBreakfastRecipeCodeList());

        Map<Integer, List<MealRecipeAnalysisDto>> breakfastRecipePool =
                getBreakfastRecipePool(recipePool, breakfastRecipeCodes);

        WeeklyMealPlanDto result = WeeklyMealPlanDto.builder()
                .startDate(startDate)
                .endDate(startDate.plusDays(6))
                .build();

        Set<String> usedMenus = new HashSet<>();
        Set<String> usedProteinDetails = new HashSet<>();

        Map<Integer, Set<String>> previousMealProteins = new HashMap<>();

        Map<String, Integer> proteinUseCount = new LinkedHashMap<>();
        proteinUseCount.put("PORK", 0);
        proteinUseCount.put("BEEF", 0);
        proteinUseCount.put("CHICKEN", 0);
        proteinUseCount.put("DUCK", 0);
        proteinUseCount.put("FISH", 0);
        proteinUseCount.put("SEAFOOD", 0);

        Map<String, Integer> ingredientUseCount = new HashMap<>();
        Map<String, Integer> soupBaseUseCount = new HashMap<>();

        Map<String, Integer> patternUseCount = new HashMap<>();
        Map<String, LocalDate> patternLastUseDate = new HashMap<>();

        Set<LocalDate> oneDishDates = getOneDishDates(startDate);

        for (int i = 0; i < 7; i++) {
            LocalDate date = startDate.plusDays(i);

            DailyMealPlanDto day = DailyMealPlanDto.builder()
                    .date(date)
                    .dayName(getDayName(date.getDayOfWeek()))
                    .build();

            Map<Integer, Set<String>> todayMealProteins = new HashMap<>();
            Set<String> todayProteins = new HashSet<>();
            Set<String> todayIngredients = new HashSet<>();

            boolean redSoupUsed = false;

            for (int mealFlag = 1; mealFlag <= 3; mealFlag++) {
                boolean requireRedSoup = mealFlag == 3 && !redSoupUsed;
                boolean oneDishMeal = mealFlag == 2 && oneDishDates.contains(date);
                boolean saturdayLunch = mealFlag == 2
                        && date.getDayOfWeek() == DayOfWeek.SATURDAY;

                Map<Integer, List<MealRecipeAnalysisDto>> mealRecipePool =
                        mealFlag == 1 ? breakfastRecipePool : recipePool;

                MealPlanDto meal = createMeal(
                        mealFlag,
                        getMealName(mealFlag),
                        mealRecipePool,
                        usedMenus,
                        previousMealProteins.get(mealFlag),
                        todayProteins,
                        proteinUseCount,
                        todayIngredients,
                        ingredientUseCount,
                        soupBaseUseCount,
                        requireRedSoup,
                        redSoupUsed,
                        oneDishMeal,
                        saturdayLunch,
                        usedProteinDetails,
                        date,
                        patternUseCount,
                        patternLastUseDate
                );

                day.getMealList().add(meal);

                MealRecipeAnalysisDto soup = meal.getMenuList().stream()
                        .filter(item ->
                                Integer.valueOf(21).equals(item.getReFlag())
                        )
                        .findFirst()
                        .orElse(null);

                if (soup != null && "Y".equals(soup.getRedSoupYn())) {
                    redSoupUsed = true;
                }

                Set<String> mealProteinSet = getMealProteinTypes(meal);

                todayMealProteins.put(
                        mealFlag,
                        new HashSet<>(mealProteinSet)
                );

                todayProteins.addAll(mealProteinSet);

                for (String protein : mealProteinSet) {
                    if (proteinUseCount.containsKey(protein)) {
                        proteinUseCount.put(
                                protein,
                                proteinUseCount.get(protein) + 1
                        );
                    }
                }
            }

            previousMealProteins = todayMealProteins;
            result.getDayList().add(day);
        }

        return result;
    }

    //생성 식단 검증
    @Transactional(readOnly = true)
    public MealPlanValidationDto validateGeneratedWeeklyMealPlan(
            LocalDate startDate) {

        return validateWeeklyMealPlan(
                createWeeklyMealPlan(startDate)
        );
    }

    //주간 식단 검증
    public MealPlanValidationDto validateWeeklyMealPlan(
            WeeklyMealPlanDto plan) {

        MealPlanValidationDto result = MealPlanValidationDto.builder()
                .valid(true)
                .build();

        validateMealCount(plan, result);
        validateDuplicateMenu(plan, result);
        validateMealProtein(plan, result);
        validatePreviousProtein(plan, result);
        validateProteinDetail(plan, result);
        validateIngredient(plan, result);
        validateSoup(plan, result);
        validateRedSoup(plan, result);
        validateCookingType(plan, result);
        validateBreakfast(plan, result);
        validateMenuPattern(plan, result);
        validateOneDish(plan, result);
        validateKimchi(plan, result);

        result.setValid(result.getErrorList().isEmpty());

        return result;
    }

    //아침 메뉴 후보
    private Map<Integer, List<MealRecipeAnalysisDto>> getBreakfastRecipePool(
            Map<Integer, List<MealRecipeAnalysisDto>> recipePool,
            Set<String> breakfastRecipeCodes) {

        Map<Integer, List<MealRecipeAnalysisDto>> result = new LinkedHashMap<>();

        for (Map.Entry<Integer, List<MealRecipeAnalysisDto>> entry
                : recipePool.entrySet()) {

            result.put(
                    entry.getKey(),
                    entry.getValue().stream()
                            .filter(item ->
                                    breakfastRecipeCodes.contains(item.getReCode())
                            )
                            .toList()
            );
        }

        return result;
    }

    //끼니 생성
    private MealPlanDto createMeal(
            Integer mealFlag,
            String mealName,
            Map<Integer, List<MealRecipeAnalysisDto>> recipePool,
            Set<String> usedMenus,
            Set<String> previousProteins,
            Set<String> todayProteins,
            Map<String, Integer> proteinUseCount,
            Set<String> todayIngredients,
            Map<String, Integer> ingredientUseCount,
            Map<String, Integer> soupBaseUseCount,
            boolean requireRedSoup,
            boolean redSoupUsed,
            boolean oneDishMeal,
            boolean saturdayLunch,
            Set<String> usedProteinDetails,
            LocalDate date,
            Map<String, Integer> patternUseCount,
            Map<String, LocalDate> patternLastUseDate) {

        MealPlanDto meal = MealPlanDto.builder()
                .mealFlag(mealFlag)
                .mealName(mealName)
                .build();

        Set<String> mealProteins = new HashSet<>();

        //일품요리
        if (oneDishMeal) {
            MealRecipeAnalysisDto oneDish = getOneDishMenu(
                    recipePool,
                    usedMenus,
                    previousProteins,
                    todayProteins,
                    todayIngredients,
                    ingredientUseCount,
                    saturdayLunch,
                    usedProteinDetails,
                    date,
                    patternUseCount,
                    patternLastUseDate
            );

            if (oneDish != null) {
                meal.getMenuList().add(oneDish);

                addUsedMenu(usedMenus, oneDish);
                addIngredientUse(
                        oneDish,
                        todayIngredients,
                        ingredientUseCount
                );
                addProteinDetailUse(
                        oneDish,
                        usedProteinDetails
                );
                addPatternUse(
                        oneDish,
                        date,
                        patternUseCount,
                        patternLastUseDate
                );
                mealProteins.addAll(oneDish.getProteinTypes());

                createOneDishSideMenus(
                        meal,
                        recipePool,
                        usedMenus,
                        previousProteins,
                        todayProteins,
                        todayIngredients,
                        ingredientUseCount,
                        soupBaseUseCount,
                        requireRedSoup,
                        redSoupUsed,
                        usedProteinDetails,
                        proteinUseCount,
                        mealProteins,
                        date,
                        patternUseCount,
                        patternLastUseDate
                );

                return meal;
            }
        }

        //주식
        MealRecipeAnalysisDto rice = getRiceMenu(
                recipePool.get(11)
        );

        if (rice != null) {
            meal.getMenuList().add(rice);
        }

        //국
        MealRecipeAnalysisDto soup = getSoupMenu(
                recipePool.get(21),
                usedMenus,
                previousProteins,
                todayProteins,
                todayIngredients,
                ingredientUseCount,
                soupBaseUseCount,
                mealFlag,
                requireRedSoup,
                redSoupUsed,
                usedProteinDetails,
                mealProteins,
                date,
                patternUseCount,
                patternLastUseDate
        );

        if (soup != null) {
            meal.getMenuList().add(soup);

            addUsedMenu(usedMenus, soup);
            addIngredientUse(
                    soup,
                    todayIngredients,
                    ingredientUseCount
            );
            addProteinDetailUse(
                    soup,
                    usedProteinDetails
            );
            addSoupUse(
                    soup,
                    soupBaseUseCount
            );
            addPatternUse(
                    soup,
                    date,
                    patternUseCount,
                    patternLastUseDate
            );
            mealProteins.addAll(soup.getProteinTypes());
        }

        //주반찬
        MealRecipeAnalysisDto main = getMainMenu(
                recipePool,
                usedMenus,
                previousProteins,
                todayProteins,
                mealProteins,
                proteinUseCount,
                todayIngredients,
                ingredientUseCount,
                null,
                null,
                mealFlag,
                false,
                usedProteinDetails,
                date,
                patternUseCount,
                patternLastUseDate
        );

        if (main != null) {
            meal.getMenuList().add(main);

            addUsedMenu(usedMenus, main);
            addIngredientUse(
                    main,
                    todayIngredients,
                    ingredientUseCount
            );
            addProteinDetailUse(
                    main,
                    usedProteinDetails
            );
            addPatternUse(
                    main,
                    date,
                    patternUseCount,
                    patternLastUseDate
            );
            mealProteins.addAll(main.getProteinTypes());
        }

        //부반찬
        MealRecipeAnalysisDto side = getMainMenu(
                recipePool,
                usedMenus,
                previousProteins,
                todayProteins,
                mealProteins,
                proteinUseCount,
                todayIngredients,
                ingredientUseCount,
                main,
                main != null ? main.getCookingType() : null,
                mealFlag,
                true,
                usedProteinDetails,
                date,
                patternUseCount,
                patternLastUseDate
        );

        if (side != null) {
            meal.getMenuList().add(side);

            addUsedMenu(usedMenus, side);
            addIngredientUse(
                    side,
                    todayIngredients,
                    ingredientUseCount
            );
            addProteinDetailUse(
                    side,
                    usedProteinDetails
            );
            addPatternUse(
                    side,
                    date,
                    patternUseCount,
                    patternLastUseDate
            );
            mealProteins.addAll(side.getProteinTypes());
        }

        //나물/무침
        MealRecipeAnalysisDto vegetable = getRandomMenu(
                recipePool.get(34),
                usedMenus,
                previousProteins,
                todayProteins,
                todayIngredients,
                ingredientUseCount,
                usedProteinDetails,
                mealProteins,
                date,
                patternUseCount,
                patternLastUseDate
        );

        if (vegetable != null) {
            meal.getMenuList().add(vegetable);

            addUsedMenu(usedMenus, vegetable);
            addIngredientUse(
                    vegetable,
                    todayIngredients,
                    ingredientUseCount
            );
            addProteinDetailUse(
                    vegetable,
                    usedProteinDetails
            );
            addPatternUse(
                    vegetable,
                    date,
                    patternUseCount,
                    patternLastUseDate
            );
            mealProteins.addAll(vegetable.getProteinTypes());
        }

        //김치
        MealRecipeAnalysisDto kimchi = getKimchiMenu(
                recipePool.get(41),
                meal.getMenuList()
        );

        if (kimchi != null) {
            meal.getMenuList().add(kimchi);
        }

        return meal;
    }

    //일품요리 부식 구성
    private void createOneDishSideMenus(
            MealPlanDto meal,
            Map<Integer, List<MealRecipeAnalysisDto>> recipePool,
            Set<String> usedMenus,
            Set<String> previousProteins,
            Set<String> todayProteins,
            Set<String> todayIngredients,
            Map<String, Integer> ingredientUseCount,
            Map<String, Integer> soupBaseUseCount,
            boolean requireRedSoup,
            boolean redSoupUsed,
            Set<String> usedProteinDetails,
            Map<String, Integer> proteinUseCount,
            Set<String> mealProteins,
            LocalDate date,
            Map<String, Integer> patternUseCount,
            Map<String, LocalDate> patternLastUseDate) {

        //국
        MealRecipeAnalysisDto soup = getSoupMenu(
                recipePool.get(21),
                usedMenus,
                previousProteins,
                todayProteins,
                todayIngredients,
                ingredientUseCount,
                soupBaseUseCount,
                2,
                requireRedSoup,
                redSoupUsed,
                usedProteinDetails,
                mealProteins,
                date,
                patternUseCount,
                patternLastUseDate
        );

        if (soup != null) {
            meal.getMenuList().add(soup);

            addUsedMenu(usedMenus, soup);
            addIngredientUse(
                    soup,
                    todayIngredients,
                    ingredientUseCount
            );
            addProteinDetailUse(
                    soup,
                    usedProteinDetails
            );
            addSoupUse(
                    soup,
                    soupBaseUseCount
            );
            addPatternUse(
                    soup,
                    date,
                    patternUseCount,
                    patternLastUseDate
            );
            mealProteins.addAll(soup.getProteinTypes());
        }

        //부반찬
        MealRecipeAnalysisDto side = getMainMenu(
                recipePool,
                usedMenus,
                previousProteins,
                todayProteins,
                mealProteins,
                proteinUseCount,
                todayIngredients,
                ingredientUseCount,
                null,
                null,
                2,
                true,
                usedProteinDetails,
                date,
                patternUseCount,
                patternLastUseDate
        );

        if (side != null) {
            meal.getMenuList().add(side);

            addUsedMenu(usedMenus, side);
            addIngredientUse(
                    side,
                    todayIngredients,
                    ingredientUseCount
            );
            addProteinDetailUse(
                    side,
                    usedProteinDetails
            );
            addPatternUse(
                    side,
                    date,
                    patternUseCount,
                    patternLastUseDate
            );
            mealProteins.addAll(side.getProteinTypes());
        }

        //나물/무침
        MealRecipeAnalysisDto vegetable = getRandomMenu(
                recipePool.get(34),
                usedMenus,
                previousProteins,
                todayProteins,
                todayIngredients,
                ingredientUseCount,
                usedProteinDetails,
                mealProteins,
                date,
                patternUseCount,
                patternLastUseDate
        );

        if (vegetable != null) {
            meal.getMenuList().add(vegetable);

            addUsedMenu(usedMenus, vegetable);
            addIngredientUse(
                    vegetable,
                    todayIngredients,
                    ingredientUseCount
            );
            addProteinDetailUse(
                    vegetable,
                    usedProteinDetails
            );
            addPatternUse(
                    vegetable,
                    date,
                    patternUseCount,
                    patternLastUseDate
            );
            mealProteins.addAll(vegetable.getProteinTypes());
        }

        //김치
        MealRecipeAnalysisDto kimchi = getKimchiMenu(
                recipePool.get(41),
                meal.getMenuList()
        );

        if (kimchi != null) {
            meal.getMenuList().add(kimchi);
        }
    }

    //메뉴 분석
    private MealRecipeAnalysisDto analyzeRecipe(
            List<MealRecipeTagDto> list) {

        if (list == null || list.isEmpty()) {
            return null;
        }

        MealRecipeAnalysisDto result = MealRecipeAnalysisDto.builder()
                .reCode(list.get(0).getReCode())
                .reFlag(list.get(0).getReFlag())
                .reFlagName(
                        getReFlagName(
                                list.get(0).getReFlag()
                        )
                )
                .reName(list.get(0).getReName())
                .processedYn("N")
                .build();

        for (MealRecipeTagDto item : list) {
            addProteinByFoodName(
                    result,
                    item.getFcName()
            );

            if (item.getTagCode() == null) {
                continue;
            }

            if ("PROTEIN".equals(item.getTagType())
                    && !result.getProteinTypes()
                    .contains(item.getTagCode())) {

                result.getProteinTypes()
                        .add(item.getTagCode());
            }

            if ("PROTEIN_DETAIL".equals(item.getTagType())
                    && !result.getProteinDetails()
                    .contains(item.getTagCode())) {

                result.getProteinDetails()
                        .add(item.getTagCode());
            }

            if ("INGREDIENT".equals(item.getTagType())
                    && !result.getIngredientTags()
                    .contains(item.getTagCode())) {

                result.getIngredientTags()
                        .add(item.getTagCode());
            }

            if ("PROCESSED".equals(item.getTagCode())) {
                result.setProcessedYn("Y");
            }
        }

        addProteinByRecipeName(result);

        result.setCookingType(
                getCookingType(result.getReName())
        );

        result.setOneDishYn(
                isOneDish(
                        result.getReFlag(),
                        result.getReName()
                ) ? "Y" : "N"
        );

        result.setNoodleYn(
                isNoodle(result.getReName()) ? "Y" : "N"
        );

        result.setMenuPattern(
                getMenuPattern(result.getReName())
        );

        if (Integer.valueOf(21).equals(result.getReFlag())) {
            result.setSoupBase(
                    getSoupBase(
                            result.getReName(),
                            list
                    )
            );

            result.setRedSoupYn(
                    getRedSoupYn(
                            result.getReName(),
                            list
                    )
            );
        }

        return result;
    }

    //일반 메뉴 선택
    private MealRecipeAnalysisDto getRandomMenu(
            List<MealRecipeAnalysisDto> list,
            Set<String> usedMenus,
            Set<String> previousProteins,
            Set<String> todayProteins,
            Set<String> todayIngredients,
            Map<String, Integer> ingredientUseCount,
            Set<String> usedProteinDetails,
            Set<String> mealProteins,
            LocalDate date,
            Map<String, Integer> patternUseCount,
            Map<String, LocalDate> patternLastUseDate) {

        if (list == null || list.isEmpty()) {
            return null;
        }

        List<MealRecipeAnalysisDto> candidates =
                new ArrayList<>(list);

        if (usedMenus != null) {
            candidates.removeIf(item ->
                    isUsedMenu(usedMenus, item)
            );
        }

        if (todayIngredients != null) {
            candidates.removeIf(item ->
                    item.getIngredientTags().stream()
                            .anyMatch(todayIngredients::contains)
            );
        }

        if (ingredientUseCount != null) {
            candidates.removeIf(item ->
                    item.getIngredientTags().stream()
                            .anyMatch(tag ->
                                    ingredientUseCount
                                            .getOrDefault(tag, 0) >= 2
                            )
            );
        }

        if (usedProteinDetails != null) {
            candidates.removeIf(item ->
                    item.getProteinDetails().stream()
                            .anyMatch(usedProteinDetails::contains)
            );
        }

        if (previousProteins != null && !previousProteins.isEmpty()) {
            candidates.removeIf(item ->
                    item.getProteinTypes().stream()
                            .anyMatch(previousProteins::contains)
            );
        }

        if (mealProteins != null && !mealProteins.isEmpty()) {
            candidates.removeIf(item ->
                    item.getProteinTypes().stream()
                            .anyMatch(mealProteins::contains)
            );
        }

        candidates.removeIf(item ->
                !isPatternAvailable(
                        item,
                        date,
                        patternUseCount,
                        patternLastUseDate
                )
        );

        if (todayProteins != null && !todayProteins.isEmpty()) {
            List<MealRecipeAnalysisDto> filtered =
                    candidates.stream()
                            .filter(item ->
                                    item.getProteinTypes().stream()
                                            .noneMatch(todayProteins::contains)
                            )
                            .toList();

            if (!filtered.isEmpty()) {
                candidates = new ArrayList<>(filtered);
            }
        }

        if (candidates.isEmpty()) {
            return null;
        }

        return candidates.get(
                ThreadLocalRandom.current()
                        .nextInt(candidates.size())
        );
    }

    //주반찬/부반찬 선택
    private MealRecipeAnalysisDto getMainMenu(
            Map<Integer, List<MealRecipeAnalysisDto>> recipePool,
            Set<String> usedMenus,
            Set<String> previousProteins,
            Set<String> todayProteins,
            Set<String> mealProteins,
            Map<String, Integer> proteinUseCount,
            Set<String> todayIngredients,
            Map<String, Integer> ingredientUseCount,
            MealRecipeAnalysisDto excludeMenu,
            String excludeCookingType,
            Integer mealFlag,
            boolean sideDish,
            Set<String> usedProteinDetails,
            LocalDate date,
            Map<String, Integer> patternUseCount,
            Map<String, LocalDate> patternLastUseDate) {

        List<MealRecipeAnalysisDto> candidates =
                new ArrayList<>();

        if (recipePool.get(31) != null) {
            candidates.addAll(recipePool.get(31));
        }

        if (recipePool.get(32) != null) {
            candidates.addAll(recipePool.get(32));
        }

        if (recipePool.get(33) != null) {
            candidates.addAll(recipePool.get(33));
        }

        if (recipePool.get(36) != null) {
            candidates.addAll(recipePool.get(36));
        }

        candidates.removeIf(item ->
                isUsedMenu(usedMenus, item)
        );

        if (excludeMenu != null) {
            candidates.removeIf(item ->
                    item.getReCode()
                            .equals(excludeMenu.getReCode())
            );
        }

        candidates.removeIf(item ->
                item.getIngredientTags().stream()
                        .anyMatch(todayIngredients::contains)
        );

        candidates.removeIf(item ->
                item.getIngredientTags().stream()
                        .anyMatch(tag ->
                                ingredientUseCount
                                        .getOrDefault(tag, 0) >= 2
                        )
        );

        candidates.removeIf(item ->
                item.getProteinDetails().stream()
                        .anyMatch(usedProteinDetails::contains)
        );

        candidates.removeIf(item ->
                !isPatternAvailable(
                        item,
                        date,
                        patternUseCount,
                        patternLastUseDate
                )
        );

        if (mealFlag == 1) {
            candidates.removeIf(item ->
                    !isBreakfastAllowed(item)
            );
        }

        if (previousProteins != null
                && !previousProteins.isEmpty()) {

            candidates.removeIf(item ->
                    item.getProteinTypes().stream()
                            .anyMatch(previousProteins::contains)
            );
        }

        if (mealProteins != null
                && !mealProteins.isEmpty()) {

            candidates.removeIf(item ->
                    item.getProteinTypes().stream()
                            .anyMatch(mealProteins::contains)
            );
        }

        if (excludeCookingType != null
                && containsAny(
                excludeCookingType,
                "볶음",
                "튀김",
                "조림",
                "구이"
        )) {

            List<MealRecipeAnalysisDto> filtered =
                    candidates.stream()
                            .filter(item ->
                                    !excludeCookingType.equals(
                                            item.getCookingType()
                                    )
                            )
                            .toList();

            if (!filtered.isEmpty()) {
                candidates =
                        new ArrayList<>(filtered);
            }
        }

        List<MealRecipeAnalysisDto> proteinCandidates =
                candidates.stream()
                        .filter(item ->
                                !item.getProteinTypes().isEmpty()
                        )
                        .toList();

        if (!proteinCandidates.isEmpty()) {
            candidates =
                    new ArrayList<>(proteinCandidates);
        }

        if (todayProteins != null
                && !todayProteins.isEmpty()) {

            List<MealRecipeAnalysisDto> filtered =
                    candidates.stream()
                            .filter(item ->
                                    item.getProteinTypes()
                                            .stream()
                                            .noneMatch(todayProteins::contains)
                            )
                            .toList();

            if (!filtered.isEmpty()) {
                candidates =
                        new ArrayList<>(filtered);
            }
        }

        if (mealFlag == 1) {
            List<MealRecipeAnalysisDto> preferred =
                    candidates.stream()
                            .filter(item ->
                                    isBreakfastPreferred(
                                            item,
                                            sideDish
                                    )
                            )
                            .toList();

            if (!preferred.isEmpty()) {
                candidates =
                        new ArrayList<>(preferred);
            }
        }

        if (candidates.isEmpty()) {
            return null;
        }

        int minCount =
                candidates.stream()
                        .mapToInt(item ->
                                getProteinUseCount(
                                        item.getProteinTypes(),
                                        proteinUseCount
                                )
                        )
                        .min()
                        .orElse(0);

        List<MealRecipeAnalysisDto> balancedCandidates =
                candidates.stream()
                        .filter(item ->
                                getProteinUseCount(
                                        item.getProteinTypes(),
                                        proteinUseCount
                                ) == minCount
                        )
                        .toList();

        return balancedCandidates.get(
                ThreadLocalRandom.current()
                        .nextInt(
                                balancedCandidates.size()
                        )
        );
    }

    //국 선택
    private MealRecipeAnalysisDto getSoupMenu(
            List<MealRecipeAnalysisDto> list,
            Set<String> usedMenus,
            Set<String> previousProteins,
            Set<String> todayProteins,
            Set<String> todayIngredients,
            Map<String, Integer> ingredientUseCount,
            Map<String, Integer> soupBaseUseCount,
            Integer mealFlag,
            boolean requireRedSoup,
            boolean redSoupUsed,
            Set<String> usedProteinDetails,
            Set<String> mealProteins,
            LocalDate date,
            Map<String, Integer> patternUseCount,
            Map<String, LocalDate> patternLastUseDate) {

        if (list == null || list.isEmpty()) {
            return null;
        }

        List<MealRecipeAnalysisDto> candidates =
                new ArrayList<>(list);

        candidates.removeIf(item ->
                isUsedMenu(usedMenus, item)
        );

        candidates.removeIf(item ->
                item.getIngredientTags().stream()
                        .anyMatch(todayIngredients::contains)
        );

        candidates.removeIf(item ->
                item.getIngredientTags().stream()
                        .anyMatch(tag ->
                                ingredientUseCount
                                        .getOrDefault(tag, 0) >= 2
                        )
        );

        candidates.removeIf(item ->
                item.getProteinDetails().stream()
                        .anyMatch(usedProteinDetails::contains)
        );

        if (previousProteins != null
                && !previousProteins.isEmpty()) {

            candidates.removeIf(item ->
                    item.getProteinTypes().stream()
                            .anyMatch(previousProteins::contains)
            );
        }

        if (mealProteins != null
                && !mealProteins.isEmpty()) {

            candidates.removeIf(item ->
                    item.getProteinTypes().stream()
                            .anyMatch(mealProteins::contains)
            );
        }

        candidates.removeIf(item ->
                ("DOENJANG".equals(item.getSoupBase())
                        || "KIMCHI".equals(item.getSoupBase())
                        || "SEAWEED".equals(item.getSoupBase()))
                        && soupBaseUseCount
                        .getOrDefault(
                                item.getSoupBase(),
                                0
                        ) >= 1
        );

        candidates.removeIf(item ->
                !isPatternAvailable(
                        item,
                        date,
                        patternUseCount,
                        patternLastUseDate
                )
        );

        if (todayProteins != null
                && !todayProteins.isEmpty()) {

            List<MealRecipeAnalysisDto> filtered =
                    candidates.stream()
                            .filter(item ->
                                    item.getProteinTypes().stream()
                                            .noneMatch(todayProteins::contains)
                            )
                            .toList();

            if (!filtered.isEmpty()) {
                candidates =
                        new ArrayList<>(filtered);
            }
        }

        if (candidates.isEmpty()) {
            return null;
        }

        if (requireRedSoup) {
            List<MealRecipeAnalysisDto> redCandidates =
                    candidates.stream()
                            .filter(item ->
                                    "Y".equals(
                                            item.getRedSoupYn()
                                    )
                            )
                            .toList();

            if (redCandidates.isEmpty()) {
                redCandidates =
                        list.stream()
                                .filter(item ->
                                        "Y".equals(
                                                item.getRedSoupYn()
                                        )
                                )
                                .filter(item ->
                                        !isUsedMenu(
                                                usedMenus,
                                                item
                                        )
                                )
                                .filter(item ->
                                        previousProteins == null
                                                || item.getProteinTypes().stream()
                                                .noneMatch(previousProteins::contains)
                                )
                                .filter(item ->
                                        mealProteins == null
                                                || item.getProteinTypes().stream()
                                                .noneMatch(mealProteins::contains)
                                )
                                .filter(item ->
                                        !("DOENJANG".equals(item.getSoupBase())
                                                || "KIMCHI".equals(item.getSoupBase())
                                                || "SEAWEED".equals(item.getSoupBase()))
                                                || soupBaseUseCount
                                                .getOrDefault(
                                                        item.getSoupBase(),
                                                        0
                                                ) < 1
                                )
                                .filter(item ->
                                        isPatternAvailable(
                                                item,
                                                date,
                                                patternUseCount,
                                                patternLastUseDate
                                        )
                                )
                                .toList();
            }

            if (!redCandidates.isEmpty()) {
                candidates =
                        new ArrayList<>(redCandidates);
            }

        } else if (redSoupUsed) {
            List<MealRecipeAnalysisDto> normalCandidates =
                    candidates.stream()
                            .filter(item ->
                                    !"Y".equals(
                                            item.getRedSoupYn()
                                    )
                            )
                            .toList();

            if (!normalCandidates.isEmpty()) {
                candidates =
                        new ArrayList<>(normalCandidates);
            }
        }

        return candidates.get(
                ThreadLocalRandom.current()
                        .nextInt(candidates.size())
        );
    }

    //일품요리 선택
    private MealRecipeAnalysisDto getOneDishMenu(
            Map<Integer, List<MealRecipeAnalysisDto>> recipePool,
            Set<String> usedMenus,
            Set<String> previousProteins,
            Set<String> todayProteins,
            Set<String> todayIngredients,
            Map<String, Integer> ingredientUseCount,
            boolean saturdayLunch,
            Set<String> usedProteinDetails,
            LocalDate date,
            Map<String, Integer> patternUseCount,
            Map<String, LocalDate> patternLastUseDate) {

        List<MealRecipeAnalysisDto> candidates =
                new ArrayList<>();

        for (List<MealRecipeAnalysisDto> list
                : recipePool.values()) {
            candidates.addAll(list);
        }

        candidates.removeIf(item ->
                !"Y".equals(item.getOneDishYn())
        );

        candidates.removeIf(item ->
                isUsedMenu(usedMenus, item)
        );

        candidates.removeIf(item ->
                item.getIngredientTags().stream()
                        .anyMatch(todayIngredients::contains)
        );

        candidates.removeIf(item ->
                item.getIngredientTags().stream()
                        .anyMatch(tag ->
                                ingredientUseCount
                                        .getOrDefault(tag, 0) >= 2
                        )
        );

        candidates.removeIf(item ->
                item.getProteinDetails().stream()
                        .anyMatch(usedProteinDetails::contains)
        );

        if (previousProteins != null
                && !previousProteins.isEmpty()) {

            candidates.removeIf(item ->
                    item.getProteinTypes().stream()
                            .anyMatch(previousProteins::contains)
            );
        }

        candidates.removeIf(item ->
                !isPatternAvailable(
                        item,
                        date,
                        patternUseCount,
                        patternLastUseDate
                )
        );

        if (todayProteins != null
                && !todayProteins.isEmpty()) {

            List<MealRecipeAnalysisDto> filtered =
                    candidates.stream()
                            .filter(item ->
                                    item.getProteinTypes().stream()
                                            .noneMatch(todayProteins::contains)
                            )
                            .toList();

            if (!filtered.isEmpty()) {
                candidates =
                        new ArrayList<>(filtered);
            }
        }

        if (candidates.isEmpty()) {
            return null;
        }

        List<MealRecipeAnalysisDto> weightedCandidates =
                new ArrayList<>();

        for (MealRecipeAnalysisDto item : candidates) {
            weightedCandidates.add(item);

            if ("Y".equals(item.getNoodleYn())) {
                weightedCandidates.add(item);

                if (saturdayLunch) {
                    weightedCandidates.add(item);
                    weightedCandidates.add(item);
                }
            }
        }

        return weightedCandidates.get(
                ThreadLocalRandom.current()
                        .nextInt(
                                weightedCandidates.size()
                        )
        );
    }

    //쌀밥
    private MealRecipeAnalysisDto getRiceMenu(
            List<MealRecipeAnalysisDto> list) {

        if (list == null || list.isEmpty()) {
            return null;
        }

        for (MealRecipeAnalysisDto item : list) {
            if ("쌀밥".equals(item.getReName())) {
                return item;
            }
        }

        return null;
    }

    //김치 선택
    private MealRecipeAnalysisDto getKimchiMenu(
            List<MealRecipeAnalysisDto> list,
            List<MealRecipeAnalysisDto> mealMenus) {

        if (list == null || list.isEmpty()) {
            return null;
        }

        boolean kimchiMenuUsed =
                mealMenus.stream()
                        .anyMatch(item ->
                                !Integer.valueOf(41)
                                        .equals(item.getReFlag())
                                        && containsAny(
                                        item.getReName(),
                                        "김치"
                                )
                        );

        if (kimchiMenuUsed) {
            List<MealRecipeAnalysisDto> kkakdugiList =
                    list.stream()
                            .filter(item ->
                                    containsAny(
                                            item.getReName(),
                                            "깍두기"
                                    )
                            )
                            .toList();

            if (!kkakdugiList.isEmpty()) {
                return kkakdugiList.get(
                        ThreadLocalRandom.current()
                                .nextInt(
                                        kkakdugiList.size()
                                )
                );
            }
        }

        List<MealRecipeAnalysisDto> baechuKimchiList =
                list.stream()
                        .filter(item ->
                                "배추김치".equals(
                                        item.getReName()
                                )
                        )
                        .toList();

        if (!baechuKimchiList.isEmpty()) {
            return baechuKimchiList.get(
                    ThreadLocalRandom.current()
                            .nextInt(
                                    baechuKimchiList.size()
                            )
            );
        }

        return list.get(
                ThreadLocalRandom.current()
                        .nextInt(list.size())
        );
    }

    //주간 일품요리 날짜
    private Set<LocalDate> getOneDishDates(
            LocalDate startDate) {

        Set<LocalDate> result = new HashSet<>();
        List<LocalDate> candidates =
                new ArrayList<>();

        LocalDate saturday = null;

        for (int i = 0; i < 7; i++) {
            LocalDate date = startDate.plusDays(i);

            if (date.getDayOfWeek()
                    == DayOfWeek.SATURDAY) {
                saturday = date;
            } else {
                candidates.add(date);
            }
        }

        if (saturday != null
                && ThreadLocalRandom.current()
                .nextDouble() < 0.7) {

            result.add(saturday);
        }

        Collections.shuffle(candidates);

        int targetCount =
                ThreadLocalRandom.current()
                        .nextInt(1, 3);

        for (LocalDate date : candidates) {
            if (result.size() >= targetCount) {
                break;
            }

            result.add(date);
        }

        return result;
    }

    //핵심 식재료 사용
    private void addIngredientUse(
            MealRecipeAnalysisDto menu,
            Set<String> todayIngredients,
            Map<String, Integer> ingredientUseCount) {

        for (String tag : menu.getIngredientTags()) {
            todayIngredients.add(tag);

            ingredientUseCount.put(
                    tag,
                    ingredientUseCount
                            .getOrDefault(tag, 0) + 1
            );
        }
    }

    //생선/해산물 세부재료 사용
    private void addProteinDetailUse(
            MealRecipeAnalysisDto menu,
            Set<String> usedProteinDetails) {

        usedProteinDetails.addAll(
                menu.getProteinDetails()
        );
    }

    //국 사용
    private void addSoupUse(
            MealRecipeAnalysisDto soup,
            Map<String, Integer> soupBaseUseCount) {

        if (soup.getSoupBase() == null
                || "ETC".equals(soup.getSoupBase())) {
            return;
        }

        soupBaseUseCount.put(
                soup.getSoupBase(),
                soupBaseUseCount
                        .getOrDefault(
                                soup.getSoupBase(),
                                0
                        ) + 1
        );
    }

    //메뉴 패턴 사용
    private void addPatternUse(
            MealRecipeAnalysisDto menu,
            LocalDate date,
            Map<String, Integer> patternUseCount,
            Map<String, LocalDate> patternLastUseDate) {

        String pattern =
                menu.getMenuPattern();

        if (pattern == null) {
            return;
        }

        patternUseCount.put(
                pattern,
                patternUseCount
                        .getOrDefault(pattern, 0) + 1
        );

        patternLastUseDate.put(
                pattern,
                date
        );
    }

    //메뉴 패턴 사용 가능 여부
    private boolean isPatternAvailable(
            MealRecipeAnalysisDto menu,
            LocalDate date,
            Map<String, Integer> patternUseCount,
            Map<String, LocalDate> patternLastUseDate) {

        String pattern =
                menu.getMenuPattern();

        if (pattern == null) {
            return true;
        }

        int maxCount =
                isWeeklySinglePattern(pattern) ? 1 : 2;

        if (patternUseCount
                .getOrDefault(pattern, 0) >= maxCount) {
            return false;
        }

        LocalDate lastDate =
                patternLastUseDate.get(pattern);

        return lastDate == null
                || !date.isBefore(
                lastDate.plusDays(3)
        );
    }

    //주 1회 메뉴군
    private boolean isWeeklySinglePattern(String pattern) {
        return containsAny(
                pattern,
                "난자완스",
                "돈채",
                "미트볼",
                "떡갈비",
                "장조림",
                "명엽채",
                "멸치조림",
                "건파래",
                "스크램블",
                "참치야채볶음",
                "고등어김치조림",
                "고등어감자조림",
                "꽁치감자조림"
        );
    }

    //단백질 사용횟수
    private int getProteinUseCount(
            List<String> proteins,
            Map<String, Integer> proteinUseCount) {

        int count = 0;

        for (String protein : proteins) {
            count += proteinUseCount
                    .getOrDefault(protein, 0);
        }

        return count;
    }

    //끼니 전체 단백질
    private Set<String> getMealProteinTypes(
            MealPlanDto meal) {

        Set<String> result = new HashSet<>();

        if (meal.getMenuList() == null) {
            return result;
        }

        for (MealRecipeAnalysisDto menu
                : meal.getMenuList()) {

            result.addAll(
                    menu.getProteinTypes()
            );
        }

        return result;
    }

    //실제 재료명 단백질 보정
    private void addProteinByFoodName(
            MealRecipeAnalysisDto recipe,
            String foodName) {

        if (foodName == null) {
            return;
        }

        if (containsAny(
                foodName,
                "돼지고기",
                "돼지갈비",
                "돈육",
                "돈갈비",
                "돈등뼈",
                "돈사태",
                "돈민찌",
                "돈목살",
                "돈삼겹",
                "돈전지",
                "돈후지",
                "돈안심",
                "돈등심"
        )) {
            addProteinType(recipe, "PORK");
        }

        if (containsAny(
                foodName,
                "소고기",
                "쇠고기",
                "우육",
                "우갈비",
                "우사태",
                "우양지",
                "우민찌",
                "우둔",
                "소갈비"
        )) {
            addProteinType(recipe, "BEEF");
        }

        if (containsAny(
                foodName,
                "닭고기",
                "닭가슴",
                "닭다리",
                "닭정육",
                "닭안심",
                "닭봉",
                "닭날개",
                "계육"
        )) {
            addProteinType(recipe, "CHICKEN");
        }

        if (!foodName.contains("오리엔탈")
                && containsAny(
                foodName,
                "오리고기",
                "훈제오리",
                "오리훈제",
                "오리정육",
                "오리로스",
                "오리불고기",
                "오리슬라이스"
        )) {
            addProteinType(recipe, "DUCK");
        }

        if (containsAny(
                foodName,
                "고등어",
                "꽁치",
                "갈치",
                "삼치",
                "가자미",
                "조기",
                "동태",
                "명태",
                "코다리",
                "대구",
                "임연수",
                "참치",
                "장어",
                "홍어",
                "아귀",
                "연어"
        )) {
            addProteinType(recipe, "FISH");
        }

        if (containsAny(
                foodName,
                "오징어",
                "문어",
                "낙지",
                "주꾸미",
                "쭈꾸미",
                "새우",
                "홍합",
                "바지락",
                "꽃게",
                "게살",
                "골뱅이"
        )) {
            addProteinType(recipe, "SEAFOOD");
        }
    }

    //메뉴명 단백질 보정
    private void addProteinByRecipeName(
            MealRecipeAnalysisDto recipe) {

        String name = recipe.getReName();

        if (name == null) {
            return;
        }

        if (containsAny(
                name,
                "돼지고기",
                "돼지갈비",
                "돼지불고기",
                "돈육",
                "돈채",
                "돈갈비",
                "돈사태",
                "돈까스",
                "돈가스",
                "제육"
        )) {
            addProteinType(recipe, "PORK");
        }

        if (containsAny(
                name,
                "소고기",
                "쇠고기",
                "소갈비",
                "소불고기",
                "우육",
                "우채",
                "우갈비",
                "우사태"
        )) {
            addProteinType(recipe, "BEEF");
        }

        if (containsAny(
                name,
                "닭",
                "치킨",
                "계육",
                "계강정",
                "계불고기",
                "계볶음",
                "계조림"
        )) {
            addProteinType(recipe, "CHICKEN");
        }

        if (!name.contains("오리엔탈")
                && name.contains("오리")) {
            addProteinType(recipe, "DUCK");
        }

        if (containsAny(
                name,
                "고등어",
                "꽁치",
                "갈치",
                "삼치",
                "가자미",
                "조기",
                "동태",
                "명태",
                "코다리",
                "대구",
                "임연수",
                "참치",
                "장어",
                "홍어",
                "아귀",
                "연어"
        )) {
            addProteinType(recipe, "FISH");
        }

        if (containsAny(
                name,
                "오징어",
                "문어",
                "낙지",
                "주꾸미",
                "쭈꾸미",
                "새우",
                "홍합",
                "바지락",
                "꽃게",
                "게살",
                "골뱅이"
        )) {
            addProteinType(recipe, "SEAFOOD");
        }
    }

    //단백질 추가
    private void addProteinType(
            MealRecipeAnalysisDto recipe,
            String proteinType) {

        if (!recipe.getProteinTypes()
                .contains(proteinType)) {

            recipe.getProteinTypes()
                    .add(proteinType);
        }
    }

    //아침 사용 가능 여부
    private boolean isBreakfastAllowed(
            MealRecipeAnalysisDto menu) {

        String name = menu.getReName();

        if ("구이".equals(menu.getCookingType())) {
            return false;
        }

        if (containsAny(
                name,
                "계란후라이",
                "달걀후라이",
                "계란찜",
                "달걀찜"
        )) {
            return false;
        }

        if (containsAny(name, "감자조림")
                && !containsAny(
                name,
                "고등어",
                "꽁치",
                "참치"
        )) {
            return false;
        }

        return true;
    }

    //아침 선호 메뉴
    private boolean isBreakfastPreferred(
            MealRecipeAnalysisDto menu,
            boolean sideDish) {

        String name = menu.getReName();

        if (sideDish) {
            return containsAny(
                    name,
                    "건파래볶음",
                    "장조림",
                    "쥐채조림",
                    "쥐포조림",
                    "명엽채조림",
                    "멸치조림",
                    "메추리알",
                    "스크램블"
            );
        }

        return containsAny(
                name,
                "미트볼",
                "떡갈비",
                "난자완스",
                "해물볶음",
                "돈채",
                "참치야채볶음",
                "고등어김치조림",
                "고등어감자조림",
                "꽁치감자조림"
        );
    }

    //국 종류
    private String getSoupBase(
            String name,
            List<MealRecipeTagDto> list) {

        if (containsAny(name, "된장")) {
            return "DOENJANG";
        }

        if (containsAny(name, "김치")) {
            return "KIMCHI";
        }

        if (containsAny(name, "미역")) {
            return "SEAWEED";
        }

        for (MealRecipeTagDto item : list) {
            if (containsAny(item.getFcName(), "된장")) {
                return "DOENJANG";
            }

            if (containsAny(item.getFcName(), "김치")) {
                return "KIMCHI";
            }

            if (containsAny(item.getFcName(), "미역")) {
                return "SEAWEED";
            }
        }

        return "ETC";
    }

    //빨간국물
    private String getRedSoupYn(
            String name,
            List<MealRecipeTagDto> list) {

        if (containsAny(
                name,
                "육개장",
                "닭개장",
                "매운탕",
                "김치",
                "부대찌개",
                "순두부찌개",
                "얼큰",
                "짬뽕",
                "해장국"
        )) {
            return "Y";
        }

        for (MealRecipeTagDto item : list) {
            if (containsAny(
                    item.getFcName(),
                    "고춧가루",
                    "고추장",
                    "다대기",
                    "김치"
            )) {
                return "Y";
            }
        }

        return "N";
    }

    //조리법
    private String getCookingType(String name) {
        if (name == null) {
            return null;
        }

        if (name.contains("볶음")) {
            return "볶음";
        }

        if (name.contains("조림")) {
            return "조림";
        }

        if (name.contains("튀김")
                || name.contains("까스")) {
            return "튀김";
        }

        if (name.contains("구이")) {
            return "구이";
        }

        if (name.contains("찜")) {
            return "찜";
        }

        if (name.contains("전")) {
            return "전";
        }

        if (name.contains("무침")) {
            return "무침";
        }

        return null;
    }

    //메뉴 패턴
    private String getMenuPattern(String name) {
        if (name == null) {
            return null;
        }

        //아침 반복 방지 메뉴군
        if (name.contains("난자완스")) {
            return "난자완스";
        }

        if (name.contains("돈채")) {
            return "돈채";
        }

        if (name.contains("미트볼")) {
            return "미트볼";
        }

        if (name.contains("떡갈비")) {
            return "떡갈비";
        }

        if (name.contains("명엽채")) {
            return "명엽채";
        }

        if (name.contains("멸치조림")) {
            return "멸치조림";
        }

        if (name.contains("건파래")) {
            return "건파래";
        }

        if (name.contains("스크램블")) {
            return "스크램블";
        }

        if (name.contains("참치야채볶음")) {
            return "참치야채볶음";
        }

        if (name.contains("고등어김치조림")) {
            return "고등어김치조림";
        }

        if (name.contains("고등어감자조림")) {
            return "고등어감자조림";
        }

        if (name.contains("꽁치감자조림")) {
            return "꽁치감자조림";
        }

        if (name.contains("스프")) {
            return "스프";
        }

        if (name.contains("어묵") && name.contains("국")) {
            return "어묵국";
        }

        if (name.contains("무국")) {
            return "무국";
        }

        if (name.contains("야채볶음")) {
            return "야채볶음";
        }

        if (name.contains("김치볶음")) {
            return "김치볶음";
        }

        if (name.contains("고추장볶음")) {
            return "고추장볶음";
        }

        if (name.contains("간장볶음")) {
            return "간장볶음";
        }

        if (name.contains("간장조림")) {
            return "간장조림";
        }

        if (name.contains("고추장조림")) {
            return "고추장조림";
        }

        if (name.contains("김치조림")) {
            return "김치조림";
        }

        if (name.contains("장조림")) {
            return "장조림";
        }

        if (name.contains("강정")) {
            return "강정";
        }

        if (name.contains("탕수")) {
            return "탕수";
        }

        if (name.contains("까스")) {
            return "까스";
        }

        return null;
    }

    //일품요리
    private boolean isOneDish(
            Integer reFlag,
            String name) {

        if (reFlag == null || name == null) {
            return false;
        }

        if (reFlag != 11 && reFlag != 51) {
            return false;
        }

        return containsAny(
                name,
                "비빔밥",
                "볶음밥",
                "카레라이스",
                "카레밥",
                "짜장밥",
                "덮밥",
                "오므라이스"
        ) || isNoodle(name);
    }

    //면요리
    private boolean isNoodle(String name) {
        return containsAny(
                name,
                "국수",
                "우동",
                "라면",
                "라멘",
                "짜장면",
                "짬뽕",
                "쫄면",
                "냉면",
                "칼국수",
                "수제비",
                "파스타",
                "스파게티",
                "소바",
                "메밀면"
        );
    }

    //메뉴 종류
    private String getReFlagName(Integer reFlag) {
        if (reFlag == null) {
            return null;
        }

        return switch (reFlag) {
            case 11 -> "주식";
            case 21 -> "국";
            case 31 -> "메인반찬";
            case 32 -> "튀김/구이";
            case 33 -> "조림";
            case 34 -> "무침/나물";
            case 36 -> "전";
            case 41 -> "김치";
            case 51 -> "특식";
            case 81 -> "후식";
            default -> "기타";
        };
    }

    //끼니명
    private String getMealName(Integer mealFlag) {
        return switch (mealFlag) {
            case 1 -> "아침";
            case 2 -> "점심";
            case 3 -> "저녁";
            default -> "";
        };
    }

    //요일
    private String getDayName(
            DayOfWeek dayOfWeek) {

        return switch (dayOfWeek) {
            case MONDAY -> "월";
            case TUESDAY -> "화";
            case WEDNESDAY -> "수";
            case THURSDAY -> "목";
            case FRIDAY -> "금";
            case SATURDAY -> "토";
            case SUNDAY -> "일";
        };
    }

    //문자열 포함
    private boolean containsAny(
            String value,
            String... keywords) {

        if (value == null) {
            return false;
        }

        for (String keyword : keywords) {
            if (value.contains(keyword)) {
                return true;
            }
        }

        return false;
    }

    //주반찬
    private MealRecipeAnalysisDto getMainMenuFromMeal(
            MealPlanDto meal) {

        if (meal.getMenuList() == null
                || meal.getMenuList().isEmpty()) {
            return null;
        }

        if ("Y".equals(
                meal.getMenuList()
                        .get(0)
                        .getOneDishYn()
        )) {
            return meal.getMenuList().get(0);
        }

        if (meal.getMenuList().size() < 3) {
            return null;
        }

        return meal.getMenuList().get(2);
    }

    //메뉴 사용 여부
    private boolean isUsedMenu(
            Set<String> usedMenus,
            MealRecipeAnalysisDto menu) {

        return usedMenus.contains(
                "CODE:" + menu.getReCode()
        ) || usedMenus.contains(
                "NAME:"
                        + menu.getReFlag()
                        + ":"
                        + menu.getReName()
        );
    }

    //메뉴 사용 등록
    private void addUsedMenu(
            Set<String> usedMenus,
            MealRecipeAnalysisDto menu) {

        usedMenus.add(
                "CODE:" + menu.getReCode()
        );

        usedMenus.add(
                "NAME:"
                        + menu.getReFlag()
                        + ":"
                        + menu.getReName()
        );
    }

    //식단 구성 개수
    private void validateMealCount(
            WeeklyMealPlanDto plan,
            MealPlanValidationDto result) {

        for (DailyMealPlanDto day
                : plan.getDayList()) {

            for (MealPlanDto meal
                    : day.getMealList()) {

                boolean oneDish =
                        !meal.getMenuList().isEmpty()
                                && "Y".equals(
                                meal.getMenuList()
                                        .get(0)
                                        .getOneDishYn()
                        );

                int expectedCount =
                        oneDish ? 5 : 6;

                if (meal.getMenuList().size()
                        != expectedCount) {

                    addValidationError(
                            result,
                            day.getDate(),
                            meal.getMealFlag(),
                            "MEAL_COUNT",
                            null,
                            "메뉴 개수가 "
                                    + expectedCount
                                    + "개가 아닙니다."
                    );
                }
            }
        }
    }

    //동일 메뉴 중복
    private void validateDuplicateMenu(
            WeeklyMealPlanDto plan,
            MealPlanValidationDto result) {

        Set<String> usedMenuCodes = new HashSet<>();
        Set<String> usedMenuNames = new HashSet<>();

        for (DailyMealPlanDto day
                : plan.getDayList()) {

            for (MealPlanDto meal
                    : day.getMealList()) {

                for (MealRecipeAnalysisDto menu
                        : meal.getMenuList()) {

                    if ("쌀밥".equals(menu.getReName())
                            || Integer.valueOf(41)
                            .equals(menu.getReFlag())) {
                        continue;
                    }

                    boolean duplicateCode =
                            !usedMenuCodes.add(
                                    menu.getReCode()
                            );

                    boolean duplicateName =
                            !usedMenuNames.add(
                                    menu.getReFlag()
                                            + ":"
                                            + menu.getReName()
                            );

                    if (duplicateCode || duplicateName) {
                        addValidationError(
                                result,
                                day.getDate(),
                                meal.getMealFlag(),
                                "DUPLICATE_MENU",
                                menu.getReCode(),
                                menu.getReName()
                                        + " 메뉴가 주간에 중복되었습니다."
                        );
                    }
                }
            }
        }
    }

    //같은 끼니 단백질 중복
    private void validateMealProtein(
            WeeklyMealPlanDto plan,
            MealPlanValidationDto result) {

        for (DailyMealPlanDto day : plan.getDayList()) {
            for (MealPlanDto meal : day.getMealList()) {
                Set<String> usedProteins = new HashSet<>();
                Set<String> duplicateProteins = new HashSet<>();

                for (MealRecipeAnalysisDto menu : meal.getMenuList()) {
                    for (String protein : menu.getProteinTypes()) {
                        if (!usedProteins.add(protein)
                                && duplicateProteins.add(protein)) {

                            addValidationError(
                                    result,
                                    day.getDate(),
                                    meal.getMealFlag(),
                                    "MEAL_PROTEIN_DUPLICATE",
                                    menu.getReCode(),
                                    "같은 끼니에 "
                                            + getProteinName(protein)
                                            + " 단백질 메뉴가 중복되었습니다."
                            );
                        }
                    }
                }
            }
        }
    }

    //단백질명
    private String getProteinName(String protein) {
        return switch (protein) {
            case "PORK" -> "돼지고기";
            case "BEEF" -> "소고기";
            case "CHICKEN" -> "닭고기";
            case "DUCK" -> "오리고기";
            case "FISH" -> "생선";
            case "SEAFOOD" -> "해산물";
            default -> protein;
        };
    }

    //전날 같은 끼니 단백질
    private void validatePreviousProtein(
            WeeklyMealPlanDto plan,
            MealPlanValidationDto result) {

        Map<Integer, Set<String>> previousMealProteins =
                new HashMap<>();

        for (DailyMealPlanDto day
                : plan.getDayList()) {

            Map<Integer, Set<String>> todayMealProteins =
                    new HashMap<>();

            for (MealPlanDto meal
                    : day.getMealList()) {

                Set<String> currentProteins =
                        getMealProteinTypes(meal);

                Set<String> previousProteins =
                        previousMealProteins.get(
                                meal.getMealFlag()
                        );

                if (previousProteins != null
                        && currentProteins.stream()
                        .anyMatch(previousProteins::contains)) {

                    addValidationError(
                            result,
                            day.getDate(),
                            meal.getMealFlag(),
                            "PREVIOUS_PROTEIN",
                            null,
                            "전날 같은 끼니와 단백질군이 중복됩니다."
                    );
                }

                todayMealProteins.put(
                        meal.getMealFlag(),
                        currentProteins
                );
            }

            previousMealProteins = todayMealProteins;
        }
    }

    //생선/해산물 세부재료
    private void validateProteinDetail(
            WeeklyMealPlanDto plan,
            MealPlanValidationDto result) {

        Set<String> usedDetails =
                new HashSet<>();

        for (DailyMealPlanDto day
                : plan.getDayList()) {

            for (MealPlanDto meal
                    : day.getMealList()) {

                for (MealRecipeAnalysisDto menu
                        : meal.getMenuList()) {

                    for (String detail
                            : menu.getProteinDetails()) {

                        if (!usedDetails.add(detail)) {
                            addValidationError(
                                    result,
                                    day.getDate(),
                                    meal.getMealFlag(),
                                    "PROTEIN_DETAIL_DUPLICATE",
                                    menu.getReCode(),
                                    detail
                                            + " 세부 식재료가 주간에 중복되었습니다."
                            );
                        }
                    }
                }
            }
        }
    }

    //핵심재료
    private void validateIngredient(
            WeeklyMealPlanDto plan,
            MealPlanValidationDto result) {

        Map<String, Integer> weeklyCount =
                new HashMap<>();

        for (DailyMealPlanDto day
                : plan.getDayList()) {

            Set<String> todayIngredients =
                    new HashSet<>();

            for (MealPlanDto meal
                    : day.getMealList()) {

                for (MealRecipeAnalysisDto menu
                        : meal.getMenuList()) {

                    for (String tag
                            : menu.getIngredientTags()) {

                        if (!todayIngredients.add(tag)) {
                            addValidationError(
                                    result,
                                    day.getDate(),
                                    meal.getMealFlag(),
                                    "DAILY_INGREDIENT_DUPLICATE",
                                    menu.getReCode(),
                                    tag
                                            + " 핵심재료가 같은 날 중복되었습니다."
                            );
                        }

                        int count =
                                weeklyCount
                                        .getOrDefault(
                                                tag,
                                                0
                                        ) + 1;

                        weeklyCount.put(
                                tag,
                                count
                        );

                        if (count > 2) {
                            addValidationError(
                                    result,
                                    day.getDate(),
                                    meal.getMealFlag(),
                                    "WEEKLY_INGREDIENT_LIMIT",
                                    menu.getReCode(),
                                    tag
                                            + " 핵심재료가 주 2회를 초과했습니다."
                            );
                        }
                    }
                }
            }
        }
    }

    //국 베이스
    private void validateSoup(
            WeeklyMealPlanDto plan,
            MealPlanValidationDto result) {

        Map<String, Integer> soupCount =
                new HashMap<>();

        for (DailyMealPlanDto day
                : plan.getDayList()) {

            for (MealPlanDto meal
                    : day.getMealList()) {

                for (MealRecipeAnalysisDto menu
                        : meal.getMenuList()) {

                    if (!Integer.valueOf(21)
                            .equals(menu.getReFlag())) {
                        continue;
                    }

                    if (!containsAny(
                            menu.getSoupBase(),
                            "DOENJANG",
                            "KIMCHI",
                            "SEAWEED"
                    )) {
                        continue;
                    }

                    int count =
                            soupCount
                                    .getOrDefault(
                                            menu.getSoupBase(),
                                            0
                                    ) + 1;

                    soupCount.put(
                            menu.getSoupBase(),
                            count
                    );

                    if (count > 1) {
                        addValidationError(
                                result,
                                day.getDate(),
                                meal.getMealFlag(),
                                "SOUP_BASE_LIMIT",
                                menu.getReCode(),
                                menu.getSoupBase()
                                        + " 국 계열이 주 1회를 초과했습니다."
                        );
                    }
                }
            }
        }
    }

    //하루 빨간국물
    private void validateRedSoup(
            WeeklyMealPlanDto plan,
            MealPlanValidationDto result) {

        for (DailyMealPlanDto day
                : plan.getDayList()) {

            boolean found =
                    day.getMealList().stream()
                            .flatMap(meal ->
                                    meal.getMenuList()
                                            .stream()
                            )
                            .anyMatch(menu ->
                                    "Y".equals(
                                            menu.getRedSoupYn()
                                    )
                            );

            if (!found) {
                addValidationError(
                        result,
                        day.getDate(),
                        null,
                        "RED_SOUP_REQUIRED",
                        null,
                        "하루에 빨간국물 메뉴가 없습니다."
                );
            }
        }
    }

    //조리법 중복
    private void validateCookingType(
            WeeklyMealPlanDto plan,
            MealPlanValidationDto result) {

        for (DailyMealPlanDto day
                : plan.getDayList()) {

            for (MealPlanDto meal
                    : day.getMealList()) {

                if (meal.getMenuList().size() < 4
                        || "Y".equals(
                        meal.getMenuList()
                                .get(0)
                                .getOneDishYn()
                )) {
                    continue;
                }

                MealRecipeAnalysisDto main =
                        meal.getMenuList().get(2);

                MealRecipeAnalysisDto side =
                        meal.getMenuList().get(3);

                if (main.getCookingType() == null
                        || side.getCookingType() == null) {
                    continue;
                }

                if (main.getCookingType()
                        .equals(side.getCookingType())
                        && containsAny(
                        main.getCookingType(),
                        "볶음",
                        "튀김",
                        "조림",
                        "구이"
                )) {

                    addValidationError(
                            result,
                            day.getDate(),
                            meal.getMealFlag(),
                            "COOKING_TYPE_DUPLICATE",
                            side.getReCode(),
                            "주반찬과 부반찬의 조리법이 "
                                    + main.getCookingType()
                                    + "으로 중복됩니다."
                    );
                }
            }
        }
    }

    //아침 메뉴
    private void validateBreakfast(
            WeeklyMealPlanDto plan,
            MealPlanValidationDto result) {

        for (DailyMealPlanDto day
                : plan.getDayList()) {

            MealPlanDto breakfast =
                    day.getMealList().stream()
                            .filter(meal ->
                                    Integer.valueOf(1)
                                            .equals(
                                                    meal.getMealFlag()
                                            )
                            )
                            .findFirst()
                            .orElse(null);

            if (breakfast == null) {
                continue;
            }

            for (MealRecipeAnalysisDto menu
                    : breakfast.getMenuList()) {

                if (!isBreakfastAllowed(menu)) {
                    addValidationError(
                            result,
                            day.getDate(),
                            1,
                            "BREAKFAST_NOT_ALLOWED",
                            menu.getReCode(),
                            menu.getReName()
                                    + " 메뉴는 아침 제한 메뉴입니다."
                    );
                }
            }
        }
    }

    //메뉴 패턴
    private void validateMenuPattern(
            WeeklyMealPlanDto plan,
            MealPlanValidationDto result) {

        Map<String, Integer> patternCount =
                new HashMap<>();

        Map<String, LocalDate> lastUseDate =
                new HashMap<>();

        for (DailyMealPlanDto day
                : plan.getDayList()) {

            for (MealPlanDto meal
                    : day.getMealList()) {

                for (MealRecipeAnalysisDto menu
                        : meal.getMenuList()) {

                    if (menu.getMenuPattern() == null) {
                        continue;
                    }

                    String pattern =
                            menu.getMenuPattern();

                    int count =
                            patternCount
                                    .getOrDefault(
                                            pattern,
                                            0
                                    ) + 1;

                    patternCount.put(
                            pattern,
                            count
                    );

                    int maxCount =
                            isWeeklySinglePattern(pattern) ? 1 : 2;

                    if (count > maxCount) {
                        addValidationError(
                                result,
                                day.getDate(),
                                meal.getMealFlag(),
                                "MENU_PATTERN_LIMIT",
                                menu.getReCode(),
                                pattern
                                        + " 패턴이 주 "
                                        + maxCount
                                        + "회를 초과했습니다."
                        );
                    }

                    LocalDate lastDate =
                            lastUseDate.get(pattern);

                    if (lastDate != null
                            && ChronoUnit.DAYS
                            .between(
                                    lastDate,
                                    day.getDate()
                            ) < 3) {

                        addValidationError(
                                result,
                                day.getDate(),
                                meal.getMealFlag(),
                                "MENU_PATTERN_INTERVAL",
                                menu.getReCode(),
                                pattern
                                        + " 패턴의 간격이 3일 미만입니다."
                        );
                    }

                    lastUseDate.put(
                            pattern,
                            day.getDate()
                    );
                }
            }
        }
    }

    //일품요리
    private void validateOneDish(
            WeeklyMealPlanDto plan,
            MealPlanValidationDto result) {

        int count = 0;

        for (DailyMealPlanDto day
                : plan.getDayList()) {

            for (MealPlanDto meal
                    : day.getMealList()) {

                boolean oneDish =
                        !meal.getMenuList().isEmpty()
                                && "Y".equals(
                                meal.getMenuList()
                                        .get(0)
                                        .getOneDishYn()
                        );

                if (!oneDish) {
                    continue;
                }

                count++;

                if (!Integer.valueOf(2)
                        .equals(meal.getMealFlag())) {

                    addValidationError(
                            result,
                            day.getDate(),
                            meal.getMealFlag(),
                            "ONE_DISH_MEAL_TIME",
                            meal.getMenuList()
                                    .get(0)
                                    .getReCode(),
                            "일품요리가 점심 외 끼니에 편성되었습니다."
                    );
                }
            }
        }

        if (count < 1 || count > 2) {
            addValidationError(
                    result,
                    null,
                    null,
                    "ONE_DISH_WEEKLY_COUNT",
                    null,
                    "일품요리는 주 1~2회가 적정합니다. 현재 "
                            + count
                            + "회입니다."
            );
        }
    }

    //김치
    private void validateKimchi(
            WeeklyMealPlanDto plan,
            MealPlanValidationDto result) {

        for (DailyMealPlanDto day
                : plan.getDayList()) {

            for (MealPlanDto meal
                    : day.getMealList()) {

                boolean kimchiMenuUsed =
                        meal.getMenuList()
                                .stream()
                                .anyMatch(menu ->
                                        !Integer.valueOf(41)
                                                .equals(
                                                        menu.getReFlag()
                                                )
                                                && containsAny(
                                                menu.getReName(),
                                                "김치"
                                        )
                                );

                if (!kimchiMenuUsed) {
                    continue;
                }

                MealRecipeAnalysisDto kimchi =
                        meal.getMenuList()
                                .stream()
                                .filter(menu ->
                                        Integer.valueOf(41)
                                                .equals(
                                                        menu.getReFlag()
                                                )
                                )
                                .findFirst()
                                .orElse(null);

                if (kimchi != null
                        && !containsAny(
                        kimchi.getReName(),
                        "깍두기"
                )) {

                    addValidationError(
                            result,
                            day.getDate(),
                            meal.getMealFlag(),
                            "KIMCHI_REPLACEMENT",
                            kimchi.getReCode(),
                            "김치 메뉴가 포함되어 있어 깍두기가 필요합니다."
                    );
                }
            }
        }
    }

    //검증 오류
    private void addValidationError(
            MealPlanValidationDto result,
            LocalDate date,
            Integer mealFlag,
            String ruleCode,
            String reCode,
            String message) {

        result.getErrorList().add(
                MealPlanValidationItemDto.builder()
                        .date(date)
                        .mealFlag(mealFlag)
                        .ruleCode(ruleCode)
                        .reCode(reCode)
                        .message(message)
                        .build()
        );
    }

    //주간식단 엑셀
    public byte[] createWeeklyMealPlanExcel(
            WeeklyMealPlanDto plan)
            throws IOException {

        try (Workbook workbook =
                     new XSSFWorkbook();
             ByteArrayOutputStream outputStream =
                     new ByteArrayOutputStream()) {

            Sheet sheet =
                    workbook.createSheet(
                            "주간식단표"
                    );

            CellStyle headerStyle =
                    createExcelHeaderStyle(workbook);

            CellStyle mealStyle =
                    createExcelMealStyle(workbook);

            CellStyle menuStyle =
                    createExcelMenuStyle(workbook);

            Row headerRow =
                    sheet.createRow(0);

            Cell typeHeader =
                    headerRow.createCell(0);

            typeHeader.setCellValue("구분");
            typeHeader.setCellStyle(
                    headerStyle
            );

            for (int i = 0;
                 i < plan.getDayList().size();
                 i++) {

                DailyMealPlanDto day =
                        plan.getDayList().get(i);

                Cell cell =
                        headerRow.createCell(i + 1);

                cell.setCellValue(
                        day.getDayName()
                                + "\n"
                                + day.getDate()
                                .getMonthValue()
                                + "/"
                                + day.getDate()
                                .getDayOfMonth()
                );

                cell.setCellStyle(
                        headerStyle
                );
            }

            for (int mealFlag = 1;
                 mealFlag <= 3;
                 mealFlag++) {

                int currentMealFlag =
                        mealFlag;

                Row row =
                        sheet.createRow(
                                currentMealFlag
                        );

                Cell mealCell =
                        row.createCell(0);

                mealCell.setCellValue(
                        getMealName(
                                currentMealFlag
                        )
                );

                mealCell.setCellStyle(
                        mealStyle
                );

                for (int dayIndex = 0;
                     dayIndex < plan
                             .getDayList()
                             .size();
                     dayIndex++) {

                    DailyMealPlanDto day =
                            plan.getDayList()
                                    .get(dayIndex);

                    MealPlanDto meal =
                            day.getMealList()
                                    .stream()
                                    .filter(item ->
                                            Integer.valueOf(
                                                    currentMealFlag
                                            ).equals(
                                                    item.getMealFlag()
                                            )
                                    )
                                    .findFirst()
                                    .orElse(null);

                    Cell cell =
                            row.createCell(
                                    dayIndex + 1
                            );

                    cell.setCellStyle(
                            menuStyle
                    );

                    if (meal == null) {
                        continue;
                    }

                    StringBuilder menuText =
                            new StringBuilder();

                    for (MealRecipeAnalysisDto menu
                            : meal.getMenuList()) {

                        if (menuText.length() > 0) {
                            menuText.append("\n");
                        }

                        menuText.append(
                                menu.getReName()
                        );
                    }

                    cell.setCellValue(
                            menuText.toString()
                    );
                }

                row.setHeightInPoints(110);
            }

            sheet.setColumnWidth(
                    0,
                    10 * 256
            );

            for (int i = 1; i <= 7; i++) {
                sheet.setColumnWidth(
                        i,
                        22 * 256
                );
            }

            sheet.createFreezePane(1, 1);

            workbook.write(outputStream);

            return outputStream.toByteArray();
        }
    }

    //엑셀 헤더 스타일
    private CellStyle createExcelHeaderStyle(
            Workbook workbook) {

        CellStyle style =
                workbook.createCellStyle();

        style.setAlignment(
                HorizontalAlignment.CENTER
        );

        style.setVerticalAlignment(
                VerticalAlignment.CENTER
        );

        style.setWrapText(true);

        style.setFillForegroundColor(
                IndexedColors.GREY_25_PERCENT
                        .getIndex()
        );

        style.setFillPattern(
                FillPatternType.SOLID_FOREGROUND
        );

        setExcelBorder(style);

        Font font =
                workbook.createFont();

        font.setBold(true);

        style.setFont(font);

        return style;
    }

    //엑셀 끼니 스타일
    private CellStyle createExcelMealStyle(
            Workbook workbook) {

        CellStyle style =
                workbook.createCellStyle();

        style.setAlignment(
                HorizontalAlignment.CENTER
        );

        style.setVerticalAlignment(
                VerticalAlignment.CENTER
        );

        setExcelBorder(style);

        Font font =
                workbook.createFont();

        font.setBold(true);

        style.setFont(font);

        return style;
    }

    //엑셀 메뉴 스타일
    private CellStyle createExcelMenuStyle(
            Workbook workbook) {

        CellStyle style =
                workbook.createCellStyle();

        style.setAlignment(
                HorizontalAlignment.CENTER
        );

        style.setVerticalAlignment(
                VerticalAlignment.CENTER
        );

        style.setWrapText(true);

        setExcelBorder(style);

        return style;
    }

    //엑셀 테두리
    private void setExcelBorder(
            CellStyle style) {

        style.setBorderTop(
                BorderStyle.THIN
        );

        style.setBorderBottom(
                BorderStyle.THIN
        );

        style.setBorderLeft(
                BorderStyle.THIN
        );

        style.setBorderRight(
                BorderStyle.THIN
        );
    }
}
