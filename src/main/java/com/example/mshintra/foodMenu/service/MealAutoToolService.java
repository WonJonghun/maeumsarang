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
            recipeMap.computeIfAbsent(item.getReCode(), key -> new ArrayList<>()).add(item);
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
            result.computeIfAbsent(item.getReFlag(), key -> new ArrayList<>()).add(item);
        }

        return result;
    }

    //주간 식단 생성
    @Transactional(readOnly = true)
    public WeeklyMealPlanDto createWeeklyMealPlan(LocalDate startDate) {
        Map<Integer, List<MealRecipeAnalysisDto>> recipePool = selectRecipePool();

        WeeklyMealPlanDto result = WeeklyMealPlanDto.builder()
                .startDate(startDate)
                .endDate(startDate.plusDays(6))
                .build();

        Set<String> usedMenuCodes = new HashSet<>();
        Set<String> usedProteinDetails = new HashSet<>();

        Map<Integer, List<String>> previousMealProteins = new HashMap<>();

        Map<String, Integer> proteinUseCount = new LinkedHashMap<>();
        proteinUseCount.put("PORK", 0);
        proteinUseCount.put("BEEF", 0);
        proteinUseCount.put("CHICKEN", 0);
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

            Map<Integer, List<String>> todayMealProteins = new HashMap<>();
            Set<String> todayProteins = new HashSet<>();
            Set<String> todayIngredients = new HashSet<>();

            boolean redSoupUsed = false;

            for (int mealFlag = 1; mealFlag <= 3; mealFlag++) {
                boolean requireRedSoup = mealFlag == 3 && !redSoupUsed;
                boolean oneDishMeal = mealFlag == 2 && oneDishDates.contains(date);
                boolean saturdayLunch = mealFlag == 2
                        && date.getDayOfWeek() == DayOfWeek.SATURDAY;

                MealPlanDto meal = createMeal(
                        mealFlag,
                        getMealName(mealFlag),
                        recipePool,
                        usedMenuCodes,
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
                        .filter(item -> Integer.valueOf(21).equals(item.getReFlag()))
                        .findFirst()
                        .orElse(null);

                if (soup != null && "Y".equals(soup.getRedSoupYn())) {
                    redSoupUsed = true;
                }

                MealRecipeAnalysisDto mainMenu = getMainMenuFromMeal(meal);

                if (mainMenu != null) {
                    todayMealProteins.put(
                            mealFlag,
                            new ArrayList<>(mainMenu.getProteinTypes())
                    );

                    for (String protein : mainMenu.getProteinTypes()) {
                        if (proteinUseCount.containsKey(protein)) {
                            proteinUseCount.put(
                                    protein,
                                    proteinUseCount.get(protein) + 1
                            );

                            todayProteins.add(protein);
                        }
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
    public MealPlanValidationDto validateGeneratedWeeklyMealPlan(LocalDate startDate) {
        return validateWeeklyMealPlan(createWeeklyMealPlan(startDate));
    }

    //주간 식단 검증
    public MealPlanValidationDto validateWeeklyMealPlan(WeeklyMealPlanDto plan) {
        MealPlanValidationDto result = MealPlanValidationDto.builder()
                .valid(true)
                .build();

        validateMealCount(plan, result);
        validateDuplicateMenu(plan, result);
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

    //끼니 생성
    private MealPlanDto createMeal(
            Integer mealFlag,
            String mealName,
            Map<Integer, List<MealRecipeAnalysisDto>> recipePool,
            Set<String> usedMenuCodes,
            List<String> previousProteins,
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

        //일품요리
        if (oneDishMeal) {
            MealRecipeAnalysisDto oneDish = getOneDishMenu(
                    recipePool,
                    usedMenuCodes,
                    todayIngredients,
                    ingredientUseCount,
                    saturdayLunch,
                    usedProteinDetails
            );

            if (oneDish != null) {
                meal.getMenuList().add(oneDish);
                usedMenuCodes.add(oneDish.getReCode());

                addIngredientUse(oneDish, todayIngredients, ingredientUseCount);
                addProteinDetailUse(oneDish, usedProteinDetails);
                addPatternUse(oneDish, date, patternUseCount, patternLastUseDate);

                createOneDishSideMenus(
                        meal,
                        recipePool,
                        usedMenuCodes,
                        todayIngredients,
                        ingredientUseCount,
                        soupBaseUseCount,
                        requireRedSoup,
                        redSoupUsed,
                        usedProteinDetails,
                        proteinUseCount,
                        date,
                        patternUseCount,
                        patternLastUseDate
                );

                return meal;
            }
        }

        //주식
        MealRecipeAnalysisDto rice = getRiceMenu(recipePool.get(11));

        if (rice != null) {
            meal.getMenuList().add(rice);
        }

        //국
        MealRecipeAnalysisDto soup = getSoupMenu(
                recipePool.get(21),
                usedMenuCodes,
                todayIngredients,
                ingredientUseCount,
                soupBaseUseCount,
                mealFlag,
                requireRedSoup,
                redSoupUsed,
                usedProteinDetails
        );

        if (soup != null) {
            meal.getMenuList().add(soup);
            usedMenuCodes.add(soup.getReCode());

            addIngredientUse(soup, todayIngredients, ingredientUseCount);
            addProteinDetailUse(soup, usedProteinDetails);
            addSoupUse(soup, soupBaseUseCount);
        }

        //주반찬
        MealRecipeAnalysisDto main = getMainMenu(
                recipePool,
                usedMenuCodes,
                previousProteins,
                todayProteins,
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
            usedMenuCodes.add(main.getReCode());

            addIngredientUse(main, todayIngredients, ingredientUseCount);
            addProteinDetailUse(main, usedProteinDetails);
            addPatternUse(main, date, patternUseCount, patternLastUseDate);
        }

        //부반찬
        MealRecipeAnalysisDto side = getMainMenu(
                recipePool,
                usedMenuCodes,
                null,
                null,
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
            usedMenuCodes.add(side.getReCode());

            addIngredientUse(side, todayIngredients, ingredientUseCount);
            addProteinDetailUse(side, usedProteinDetails);
            addPatternUse(side, date, patternUseCount, patternLastUseDate);
        }

        //나물/무침
        MealRecipeAnalysisDto vegetable = getRandomMenu(
                recipePool.get(34),
                usedMenuCodes,
                todayIngredients,
                ingredientUseCount,
                usedProteinDetails
        );

        if (vegetable != null) {
            meal.getMenuList().add(vegetable);
            usedMenuCodes.add(vegetable.getReCode());

            addIngredientUse(vegetable, todayIngredients, ingredientUseCount);
            addProteinDetailUse(vegetable, usedProteinDetails);
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
            Set<String> usedMenuCodes,
            Set<String> todayIngredients,
            Map<String, Integer> ingredientUseCount,
            Map<String, Integer> soupBaseUseCount,
            boolean requireRedSoup,
            boolean redSoupUsed,
            Set<String> usedProteinDetails,
            Map<String, Integer> proteinUseCount,
            LocalDate date,
            Map<String, Integer> patternUseCount,
            Map<String, LocalDate> patternLastUseDate) {

        //국
        MealRecipeAnalysisDto soup = getSoupMenu(
                recipePool.get(21),
                usedMenuCodes,
                todayIngredients,
                ingredientUseCount,
                soupBaseUseCount,
                2,
                requireRedSoup,
                redSoupUsed,
                usedProteinDetails
        );

        if (soup != null) {
            meal.getMenuList().add(soup);
            usedMenuCodes.add(soup.getReCode());

            addIngredientUse(soup, todayIngredients, ingredientUseCount);
            addProteinDetailUse(soup, usedProteinDetails);
            addSoupUse(soup, soupBaseUseCount);
        }

        //부반찬
        MealRecipeAnalysisDto side = getMainMenu(
                recipePool,
                usedMenuCodes,
                null,
                null,
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
            usedMenuCodes.add(side.getReCode());

            addIngredientUse(side, todayIngredients, ingredientUseCount);
            addProteinDetailUse(side, usedProteinDetails);
            addPatternUse(side, date, patternUseCount, patternLastUseDate);
        }

        //나물/무침
        MealRecipeAnalysisDto vegetable = getRandomMenu(
                recipePool.get(34),
                usedMenuCodes,
                todayIngredients,
                ingredientUseCount,
                usedProteinDetails
        );

        if (vegetable != null) {
            meal.getMenuList().add(vegetable);
            usedMenuCodes.add(vegetable.getReCode());

            addIngredientUse(vegetable, todayIngredients, ingredientUseCount);
            addProteinDetailUse(vegetable, usedProteinDetails);
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
    private MealRecipeAnalysisDto analyzeRecipe(List<MealRecipeTagDto> list) {
        if (list == null || list.isEmpty()) {
            return null;
        }

        MealRecipeAnalysisDto result = MealRecipeAnalysisDto.builder()
                .reCode(list.get(0).getReCode())
                .reFlag(list.get(0).getReFlag())
                .reFlagName(getReFlagName(list.get(0).getReFlag()))
                .reName(list.get(0).getReName())
                .processedYn("N")
                .build();

        for (MealRecipeTagDto item : list) {
            if (item.getTagCode() == null) {
                continue;
            }

            if ("PROTEIN".equals(item.getTagType())
                    && !result.getProteinTypes().contains(item.getTagCode())) {
                result.getProteinTypes().add(item.getTagCode());
            }

            if ("PROTEIN_DETAIL".equals(item.getTagType())
                    && !result.getProteinDetails().contains(item.getTagCode())) {
                result.getProteinDetails().add(item.getTagCode());
            }

            if ("INGREDIENT".equals(item.getTagType())
                    && !result.getIngredientTags().contains(item.getTagCode())) {
                result.getIngredientTags().add(item.getTagCode());
            }

            if ("PROCESSED".equals(item.getTagCode())) {
                result.setProcessedYn("Y");
            }
        }

        result.setCookingType(getCookingType(result.getReName()));
        result.setOneDishYn(isOneDish(result.getReFlag(), result.getReName()) ? "Y" : "N");
        result.setNoodleYn(isNoodle(result.getReName()) ? "Y" : "N");
        result.setMenuPattern(getMenuPattern(result.getReName()));

        if (Integer.valueOf(21).equals(result.getReFlag())) {
            result.setSoupBase(getSoupBase(result.getReName(), list));
            result.setRedSoupYn(getRedSoupYn(result.getReName(), list));
        }

        return result;
    }

    //일반 메뉴 선택
    private MealRecipeAnalysisDto getRandomMenu(
            List<MealRecipeAnalysisDto> list,
            Set<String> usedMenuCodes,
            Set<String> todayIngredients,
            Map<String, Integer> ingredientUseCount,
            Set<String> usedProteinDetails) {

        if (list == null || list.isEmpty()) {
            return null;
        }

        List<MealRecipeAnalysisDto> candidates = new ArrayList<>(list);

        if (usedMenuCodes != null) {
            candidates.removeIf(item ->
                    usedMenuCodes.contains(item.getReCode())
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
                                    ingredientUseCount.getOrDefault(tag, 0) >= 2
                            )
            );
        }

        if (usedProteinDetails != null) {
            candidates.removeIf(item ->
                    item.getProteinDetails().stream()
                            .anyMatch(usedProteinDetails::contains)
            );
        }

        if (candidates.isEmpty()) {
            return null;
        }

        return candidates.get(
                ThreadLocalRandom.current().nextInt(candidates.size())
        );
    }

    //주반찬/부반찬 선택
    private MealRecipeAnalysisDto getMainMenu(
            Map<Integer, List<MealRecipeAnalysisDto>> recipePool,
            Set<String> usedMenuCodes,
            List<String> previousProteins,
            Set<String> todayProteins,
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

        List<MealRecipeAnalysisDto> candidates = new ArrayList<>();

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
                usedMenuCodes.contains(item.getReCode())
        );

        if (excludeMenu != null) {
            candidates.removeIf(item ->
                    item.getReCode().equals(excludeMenu.getReCode())
            );
        }

        //같은 날 핵심재료 중복
        candidates.removeIf(item ->
                item.getIngredientTags().stream()
                        .anyMatch(todayIngredients::contains)
        );

        //핵심재료 주 2회 제한
        candidates.removeIf(item ->
                item.getIngredientTags().stream()
                        .anyMatch(tag ->
                                ingredientUseCount.getOrDefault(tag, 0) >= 2
                        )
        );

        //생선/해산물 세부재료 주간 중복
        candidates.removeIf(item ->
                item.getProteinDetails().stream()
                        .anyMatch(usedProteinDetails::contains)
        );

        //메뉴 패턴 제한
        candidates.removeIf(item ->
                !isPatternAvailable(
                        item,
                        date,
                        patternUseCount,
                        patternLastUseDate
                )
        );

        //주반찬과 부반찬 조리법 중복 제한
        if (excludeCookingType != null
                && containsAny(
                excludeCookingType,
                "볶음",
                "튀김",
                "조림",
                "구이"
        )) {
            List<MealRecipeAnalysisDto> filtered = candidates.stream()
                    .filter(item ->
                            !excludeCookingType.equals(item.getCookingType())
                    )
                    .toList();

            if (!filtered.isEmpty()) {
                candidates = new ArrayList<>(filtered);
            }
        }

        //아침 메뉴 제한
        if (mealFlag == 1) {
            candidates.removeIf(item -> !isBreakfastAllowed(item));
        }

        //단백질 메뉴 우선
        List<MealRecipeAnalysisDto> proteinCandidates = candidates.stream()
                .filter(item -> !item.getProteinTypes().isEmpty())
                .toList();

        if (!proteinCandidates.isEmpty()) {
            candidates = new ArrayList<>(proteinCandidates);
        }

        //전날 같은 끼니 단백질 제외
        if (previousProteins != null && !previousProteins.isEmpty()) {
            List<MealRecipeAnalysisDto> filtered = candidates.stream()
                    .filter(item ->
                            item.getProteinTypes().stream()
                                    .noneMatch(previousProteins::contains)
                    )
                    .toList();

            if (!filtered.isEmpty()) {
                candidates = new ArrayList<>(filtered);
            }
        }

        //오늘 이미 사용한 주반찬 단백질 제외
        if (todayProteins != null && !todayProteins.isEmpty()) {
            List<MealRecipeAnalysisDto> filtered = candidates.stream()
                    .filter(item ->
                            item.getProteinTypes().stream()
                                    .noneMatch(todayProteins::contains)
                    )
                    .toList();

            if (!filtered.isEmpty()) {
                candidates = new ArrayList<>(filtered);
            }
        }

        //아침 선호 메뉴 우선
        if (mealFlag == 1) {
            List<MealRecipeAnalysisDto> preferred = candidates.stream()
                    .filter(item -> isBreakfastPreferred(item, sideDish))
                    .toList();

            if (!preferred.isEmpty()) {
                candidates = new ArrayList<>(preferred);
            }
        }

        if (candidates.isEmpty()) {
            return null;
        }

        int minCount = candidates.stream()
                .mapToInt(item ->
                        getProteinUseCount(
                                item.getProteinTypes(),
                                proteinUseCount
                        )
                )
                .min()
                .orElse(0);

        List<MealRecipeAnalysisDto> balancedCandidates = candidates.stream()
                .filter(item ->
                        getProteinUseCount(
                                item.getProteinTypes(),
                                proteinUseCount
                        ) == minCount
                )
                .toList();

        return balancedCandidates.get(
                ThreadLocalRandom.current().nextInt(balancedCandidates.size())
        );
    }

    //국 선택
    private MealRecipeAnalysisDto getSoupMenu(
            List<MealRecipeAnalysisDto> list,
            Set<String> usedMenuCodes,
            Set<String> todayIngredients,
            Map<String, Integer> ingredientUseCount,
            Map<String, Integer> soupBaseUseCount,
            Integer mealFlag,
            boolean requireRedSoup,
            boolean redSoupUsed,
            Set<String> usedProteinDetails) {

        if (list == null || list.isEmpty()) {
            return null;
        }

        List<MealRecipeAnalysisDto> candidates = new ArrayList<>(list);

        candidates.removeIf(item ->
                usedMenuCodes.contains(item.getReCode())
        );

        candidates.removeIf(item ->
                item.getIngredientTags().stream()
                        .anyMatch(todayIngredients::contains)
        );

        candidates.removeIf(item ->
                item.getIngredientTags().stream()
                        .anyMatch(tag ->
                                ingredientUseCount.getOrDefault(tag, 0) >= 2
                        )
        );

        candidates.removeIf(item ->
                item.getProteinDetails().stream()
                        .anyMatch(usedProteinDetails::contains)
        );

        //된장/김치/미역 주 1회
        candidates.removeIf(item ->
                ("DOENJANG".equals(item.getSoupBase())
                        || "KIMCHI".equals(item.getSoupBase())
                        || "SEAWEED".equals(item.getSoupBase()))
                        && soupBaseUseCount.getOrDefault(item.getSoupBase(), 0) >= 1
        );

        if (candidates.isEmpty()) {
            return null;
        }

        //하루 빨간국물이 아직 없으면 빨간국 우선
        if (requireRedSoup) {
            List<MealRecipeAnalysisDto> redCandidates = candidates.stream()
                    .filter(item -> "Y".equals(item.getRedSoupYn()))
                    .toList();

            if (redCandidates.isEmpty()) {
                redCandidates = list.stream()
                        .filter(item -> "Y".equals(item.getRedSoupYn()))
                        .filter(item -> !usedMenuCodes.contains(item.getReCode()))
                        .filter(item ->
                                !("DOENJANG".equals(item.getSoupBase())
                                        || "KIMCHI".equals(item.getSoupBase())
                                        || "SEAWEED".equals(item.getSoupBase()))
                                        || soupBaseUseCount.getOrDefault(item.getSoupBase(), 0) < 1
                        )
                        .toList();
            }

            if (!redCandidates.isEmpty()) {
                candidates = new ArrayList<>(redCandidates);
            }
        }

        //아침은 가벼운 국 우선
        if (mealFlag == 1 && !requireRedSoup) {
            List<MealRecipeAnalysisDto> lightCandidates = candidates.stream()
                    .filter(this::isLightSoup)
                    .toList();

            if (!lightCandidates.isEmpty()
                    && ThreadLocalRandom.current().nextDouble() < 0.8) {
                candidates = new ArrayList<>(lightCandidates);
            }
        }

        return candidates.get(
                ThreadLocalRandom.current().nextInt(candidates.size())
        );
    }

    //일품요리 선택
    private MealRecipeAnalysisDto getOneDishMenu(
            Map<Integer, List<MealRecipeAnalysisDto>> recipePool,
            Set<String> usedMenuCodes,
            Set<String> todayIngredients,
            Map<String, Integer> ingredientUseCount,
            boolean saturdayLunch,
            Set<String> usedProteinDetails) {

        List<MealRecipeAnalysisDto> candidates = new ArrayList<>();

        for (List<MealRecipeAnalysisDto> list : recipePool.values()) {
            candidates.addAll(list);
        }

        candidates.removeIf(item ->
                !"Y".equals(item.getOneDishYn())
        );

        candidates.removeIf(item ->
                usedMenuCodes.contains(item.getReCode())
        );

        candidates.removeIf(item ->
                item.getIngredientTags().stream()
                        .anyMatch(todayIngredients::contains)
        );

        candidates.removeIf(item ->
                item.getIngredientTags().stream()
                        .anyMatch(tag ->
                                ingredientUseCount.getOrDefault(tag, 0) >= 2
                        )
        );

        candidates.removeIf(item ->
                item.getProteinDetails().stream()
                        .anyMatch(usedProteinDetails::contains)
        );

        if (candidates.isEmpty()) {
            return null;
        }

        List<MealRecipeAnalysisDto> weightedCandidates = new ArrayList<>();

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
                ThreadLocalRandom.current().nextInt(weightedCandidates.size())
        );
    }

    //쌀밥
    private MealRecipeAnalysisDto getRiceMenu(List<MealRecipeAnalysisDto> list) {
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

        boolean kimchiMenuUsed = mealMenus.stream()
                .anyMatch(item ->
                        !Integer.valueOf(41).equals(item.getReFlag())
                                && containsAny(item.getReName(), "김치")
                );

        if (kimchiMenuUsed) {
            List<MealRecipeAnalysisDto> kkakdugiList = list.stream()
                    .filter(item -> containsAny(item.getReName(), "깍두기"))
                    .toList();

            if (!kkakdugiList.isEmpty()) {
                return kkakdugiList.get(
                        ThreadLocalRandom.current().nextInt(kkakdugiList.size())
                );
            }
        }

        List<MealRecipeAnalysisDto> baechuKimchiList = list.stream()
                .filter(item -> "배추김치".equals(item.getReName()))
                .toList();

        if (!baechuKimchiList.isEmpty()) {
            return baechuKimchiList.get(
                    ThreadLocalRandom.current().nextInt(baechuKimchiList.size())
            );
        }

        return list.get(
                ThreadLocalRandom.current().nextInt(list.size())
        );
    }

    //주간 일품요리 날짜
    private Set<LocalDate> getOneDishDates(LocalDate startDate) {
        Set<LocalDate> result = new HashSet<>();
        List<LocalDate> candidates = new ArrayList<>();

        LocalDate saturday = null;

        for (int i = 0; i < 7; i++) {
            LocalDate date = startDate.plusDays(i);

            if (date.getDayOfWeek() == DayOfWeek.SATURDAY) {
                saturday = date;
            } else {
                candidates.add(date);
            }
        }

        if (saturday != null
                && ThreadLocalRandom.current().nextDouble() < 0.7) {
            result.add(saturday);
        }

        Collections.shuffle(candidates);

        int targetCount = ThreadLocalRandom.current().nextInt(1, 3);

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
                    ingredientUseCount.getOrDefault(tag, 0) + 1
            );
        }
    }

    //생선/해산물 세부재료 사용
    private void addProteinDetailUse(
            MealRecipeAnalysisDto menu,
            Set<String> usedProteinDetails) {

        usedProteinDetails.addAll(menu.getProteinDetails());
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
                soupBaseUseCount.getOrDefault(soup.getSoupBase(), 0) + 1
        );
    }

    //메뉴 패턴 사용
    private void addPatternUse(
            MealRecipeAnalysisDto menu,
            LocalDate date,
            Map<String, Integer> patternUseCount,
            Map<String, LocalDate> patternLastUseDate) {

        String pattern = menu.getMenuPattern();

        if (pattern == null) {
            return;
        }

        patternUseCount.put(
                pattern,
                patternUseCount.getOrDefault(pattern, 0) + 1
        );

        patternLastUseDate.put(pattern, date);
    }

    //메뉴 패턴 사용 가능 여부
    private boolean isPatternAvailable(
            MealRecipeAnalysisDto menu,
            LocalDate date,
            Map<String, Integer> patternUseCount,
            Map<String, LocalDate> patternLastUseDate) {

        String pattern = menu.getMenuPattern();

        if (pattern == null) {
            return true;
        }

        if (patternUseCount.getOrDefault(pattern, 0) >= 2) {
            return false;
        }

        LocalDate lastDate = patternLastUseDate.get(pattern);

        return lastDate == null
                || !date.isBefore(lastDate.plusDays(3));
    }

    //단백질 사용횟수
    private int getProteinUseCount(
            List<String> proteins,
            Map<String, Integer> proteinUseCount) {

        int count = 0;

        for (String protein : proteins) {
            count += proteinUseCount.getOrDefault(protein, 0);
        }

        return count;
    }

    //아침 사용 가능 여부
    private boolean isBreakfastAllowed(MealRecipeAnalysisDto menu) {
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

    //가벼운 국
    private boolean isLightSoup(MealRecipeAnalysisDto menu) {
        if ("Y".equals(menu.getRedSoupYn())) {
            return false;
        }

        return !containsAny(
                menu.getReName(),
                "찌개",
                "전골",
                "곰탕",
                "설렁탕",
                "육개장",
                "해장국",
                "매운탕"
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

        if (name.contains("튀김") || name.contains("까스")) {
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
    private boolean isOneDish(Integer reFlag, String name) {
        if (reFlag == null || name == null) {
            return false;
        }

        //주식 또는 특식으로 등록된 메뉴만 일품요리 후보
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
    private String getDayName(DayOfWeek dayOfWeek) {
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
    private boolean containsAny(String value, String... keywords) {
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
    private MealRecipeAnalysisDto getMainMenuFromMeal(MealPlanDto meal) {
        if (meal.getMenuList() == null || meal.getMenuList().isEmpty()) {
            return null;
        }

        if ("Y".equals(meal.getMenuList().get(0).getOneDishYn())) {
            return meal.getMenuList().get(0);
        }

        if (meal.getMenuList().size() < 3) {
            return null;
        }

        return meal.getMenuList().get(2);
    }

    //식단 구성 개수
    private void validateMealCount(
            WeeklyMealPlanDto plan,
            MealPlanValidationDto result) {

        for (DailyMealPlanDto day : plan.getDayList()) {
            for (MealPlanDto meal : day.getMealList()) {
                boolean oneDish = !meal.getMenuList().isEmpty()
                        && "Y".equals(meal.getMenuList().get(0).getOneDishYn());

                int expectedCount = oneDish ? 5 : 6;

                if (meal.getMenuList().size() != expectedCount) {
                    addValidationError(
                            result,
                            day.getDate(),
                            meal.getMealFlag(),
                            "MEAL_COUNT",
                            null,
                            "메뉴 개수가 " + expectedCount + "개가 아닙니다."
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

        for (DailyMealPlanDto day : plan.getDayList()) {
            for (MealPlanDto meal : day.getMealList()) {
                for (MealRecipeAnalysisDto menu : meal.getMenuList()) {
                    if (Integer.valueOf(11).equals(menu.getReFlag())
                            || Integer.valueOf(41).equals(menu.getReFlag())) {
                        continue;
                    }

                    if (!usedMenuCodes.add(menu.getReCode())) {
                        addValidationError(
                                result,
                                day.getDate(),
                                meal.getMealFlag(),
                                "DUPLICATE_MENU",
                                menu.getReCode(),
                                menu.getReName() + " 메뉴가 주간에 중복되었습니다."
                        );
                    }
                }
            }
        }
    }

    //전날 같은 끼니 단백질
    private void validatePreviousProtein(
            WeeklyMealPlanDto plan,
            MealPlanValidationDto result) {

        Map<Integer, MealRecipeAnalysisDto> previousMainMap = new HashMap<>();

        for (DailyMealPlanDto day : plan.getDayList()) {
            Map<Integer, MealRecipeAnalysisDto> todayMainMap = new HashMap<>();

            for (MealPlanDto meal : day.getMealList()) {
                MealRecipeAnalysisDto main = getMainMenuFromMeal(meal);

                if (main == null) {
                    continue;
                }

                MealRecipeAnalysisDto previous = previousMainMap.get(
                        meal.getMealFlag()
                );

                if (previous != null
                        && main.getProteinTypes().stream()
                        .anyMatch(previous.getProteinTypes()::contains)) {

                    addValidationError(
                            result,
                            day.getDate(),
                            meal.getMealFlag(),
                            "PREVIOUS_PROTEIN",
                            main.getReCode(),
                            "전날 같은 끼니와 주반찬 단백질군이 중복됩니다."
                    );
                }

                todayMainMap.put(meal.getMealFlag(), main);
            }

            previousMainMap = todayMainMap;
        }
    }

    //생선/해산물 세부재료
    private void validateProteinDetail(
            WeeklyMealPlanDto plan,
            MealPlanValidationDto result) {

        Set<String> usedDetails = new HashSet<>();

        for (DailyMealPlanDto day : plan.getDayList()) {
            for (MealPlanDto meal : day.getMealList()) {
                for (MealRecipeAnalysisDto menu : meal.getMenuList()) {
                    for (String detail : menu.getProteinDetails()) {
                        if (!usedDetails.add(detail)) {
                            addValidationError(
                                    result,
                                    day.getDate(),
                                    meal.getMealFlag(),
                                    "PROTEIN_DETAIL_DUPLICATE",
                                    menu.getReCode(),
                                    detail + " 세부 식재료가 주간에 중복되었습니다."
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

        Map<String, Integer> weeklyCount = new HashMap<>();

        for (DailyMealPlanDto day : plan.getDayList()) {
            Set<String> todayIngredients = new HashSet<>();

            for (MealPlanDto meal : day.getMealList()) {
                for (MealRecipeAnalysisDto menu : meal.getMenuList()) {
                    for (String tag : menu.getIngredientTags()) {

                        if (!todayIngredients.add(tag)) {
                            addValidationError(
                                    result,
                                    day.getDate(),
                                    meal.getMealFlag(),
                                    "DAILY_INGREDIENT_DUPLICATE",
                                    menu.getReCode(),
                                    tag + " 핵심재료가 같은 날 중복되었습니다."
                            );
                        }

                        int count = weeklyCount.getOrDefault(tag, 0) + 1;
                        weeklyCount.put(tag, count);

                        if (count > 2) {
                            addValidationError(
                                    result,
                                    day.getDate(),
                                    meal.getMealFlag(),
                                    "WEEKLY_INGREDIENT_LIMIT",
                                    menu.getReCode(),
                                    tag + " 핵심재료가 주 2회를 초과했습니다."
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

        Map<String, Integer> soupCount = new HashMap<>();

        for (DailyMealPlanDto day : plan.getDayList()) {
            for (MealPlanDto meal : day.getMealList()) {
                for (MealRecipeAnalysisDto menu : meal.getMenuList()) {

                    if (!Integer.valueOf(21).equals(menu.getReFlag())) {
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

                    int count = soupCount.getOrDefault(
                            menu.getSoupBase(),
                            0
                    ) + 1;

                    soupCount.put(menu.getSoupBase(), count);

                    if (count > 1) {
                        addValidationError(
                                result,
                                day.getDate(),
                                meal.getMealFlag(),
                                "SOUP_BASE_LIMIT",
                                menu.getReCode(),
                                menu.getSoupBase() + " 국 계열이 주 1회를 초과했습니다."
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

        for (DailyMealPlanDto day : plan.getDayList()) {
            boolean found = day.getMealList().stream()
                    .flatMap(meal -> meal.getMenuList().stream())
                    .anyMatch(menu -> "Y".equals(menu.getRedSoupYn()));

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

        for (DailyMealPlanDto day : plan.getDayList()) {
            for (MealPlanDto meal : day.getMealList()) {

                if (meal.getMenuList().size() < 4
                        || "Y".equals(meal.getMenuList().get(0).getOneDishYn())) {
                    continue;
                }

                MealRecipeAnalysisDto main = meal.getMenuList().get(2);
                MealRecipeAnalysisDto side = meal.getMenuList().get(3);

                if (main.getCookingType() == null
                        || side.getCookingType() == null) {
                    continue;
                }

                if (main.getCookingType().equals(side.getCookingType())
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

        for (DailyMealPlanDto day : plan.getDayList()) {
            MealPlanDto breakfast = day.getMealList().stream()
                    .filter(meal -> Integer.valueOf(1).equals(meal.getMealFlag()))
                    .findFirst()
                    .orElse(null);

            if (breakfast == null) {
                continue;
            }

            for (MealRecipeAnalysisDto menu : breakfast.getMenuList()) {
                if (!isBreakfastAllowed(menu)) {
                    addValidationError(
                            result,
                            day.getDate(),
                            1,
                            "BREAKFAST_NOT_ALLOWED",
                            menu.getReCode(),
                            menu.getReName() + " 메뉴는 아침 제한 메뉴입니다."
                    );
                }
            }
        }
    }

    //메뉴 패턴
    private void validateMenuPattern(
            WeeklyMealPlanDto plan,
            MealPlanValidationDto result) {

        Map<String, Integer> patternCount = new HashMap<>();
        Map<String, LocalDate> lastUseDate = new HashMap<>();

        for (DailyMealPlanDto day : plan.getDayList()) {
            for (MealPlanDto meal : day.getMealList()) {
                for (MealRecipeAnalysisDto menu : meal.getMenuList()) {

                    if (menu.getMenuPattern() == null) {
                        continue;
                    }

                    String pattern = menu.getMenuPattern();

                    int count = patternCount.getOrDefault(pattern, 0) + 1;
                    patternCount.put(pattern, count);

                    if (count > 2) {
                        addValidationError(
                                result,
                                day.getDate(),
                                meal.getMealFlag(),
                                "MENU_PATTERN_LIMIT",
                                menu.getReCode(),
                                pattern + " 패턴이 주 2회를 초과했습니다."
                        );
                    }

                    LocalDate lastDate = lastUseDate.get(pattern);

                    if (lastDate != null
                            && ChronoUnit.DAYS.between(
                            lastDate,
                            day.getDate()
                    ) < 3) {
                        addValidationError(
                                result,
                                day.getDate(),
                                meal.getMealFlag(),
                                "MENU_PATTERN_INTERVAL",
                                menu.getReCode(),
                                pattern + " 패턴의 간격이 3일 미만입니다."
                        );
                    }

                    lastUseDate.put(pattern, day.getDate());
                }
            }
        }
    }

    //일품요리
    private void validateOneDish(
            WeeklyMealPlanDto plan,
            MealPlanValidationDto result) {

        int count = 0;

        for (DailyMealPlanDto day : plan.getDayList()) {
            for (MealPlanDto meal : day.getMealList()) {
                boolean oneDish = !meal.getMenuList().isEmpty()
                        && "Y".equals(meal.getMenuList().get(0).getOneDishYn());

                if (!oneDish) {
                    continue;
                }

                count++;

                if (!Integer.valueOf(2).equals(meal.getMealFlag())) {
                    addValidationError(
                            result,
                            day.getDate(),
                            meal.getMealFlag(),
                            "ONE_DISH_MEAL_TIME",
                            null,
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
                            + count + "회입니다."
            );
        }
    }

    //김치
    private void validateKimchi(
            WeeklyMealPlanDto plan,
            MealPlanValidationDto result) {

        for (DailyMealPlanDto day : plan.getDayList()) {
            for (MealPlanDto meal : day.getMealList()) {

                boolean kimchiMenuUsed = meal.getMenuList().stream()
                        .anyMatch(menu ->
                                !Integer.valueOf(41).equals(menu.getReFlag())
                                        && containsAny(menu.getReName(), "김치")
                        );

                if (!kimchiMenuUsed) {
                    continue;
                }

                MealRecipeAnalysisDto kimchi = meal.getMenuList().stream()
                        .filter(menu ->
                                Integer.valueOf(41).equals(menu.getReFlag())
                        )
                        .findFirst()
                        .orElse(null);

                if (kimchi != null
                        && !containsAny(kimchi.getReName(), "깍두기")) {

                    addValidationError(
                            result,
                            day.getDate(),
                            meal.getMealFlag(),
                            "KIMCHI_REPLACEMENT",
                            kimchi.getReCode(),
                            "김치 메뉴가 포함되어 있어 깍두기 계열이 필요합니다."
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
            WeeklyMealPlanDto plan) throws IOException {

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            var sheet = workbook.createSheet("주간식단표");

            CellStyle headerStyle = createExcelHeaderStyle(workbook);
            CellStyle mealStyle = createExcelMealStyle(workbook);
            CellStyle menuStyle = createExcelMenuStyle(workbook);

            //요일
            Row headerRow = sheet.createRow(0);

            Cell typeHeader = headerRow.createCell(0);
            typeHeader.setCellValue("구분");
            typeHeader.setCellStyle(headerStyle);

            for (int i = 0; i < plan.getDayList().size(); i++) {
                DailyMealPlanDto day = plan.getDayList().get(i);

                Cell cell = headerRow.createCell(i + 1);

                cell.setCellValue(
                        day.getDayName()
                                + "\n"
                                + day.getDate().getMonthValue()
                                + "/"
                                + day.getDate().getDayOfMonth()
                );

                cell.setCellStyle(headerStyle);
            }

            //아침/점심/저녁
            for (int mealFlag = 1; mealFlag <= 3; mealFlag++) {
                int currentMealFlag = mealFlag;

                Row row = sheet.createRow(currentMealFlag);

                Cell mealCell = row.createCell(0);
                mealCell.setCellValue(getMealName(currentMealFlag));
                mealCell.setCellStyle(mealStyle);

                for (int dayIndex = 0;
                     dayIndex < plan.getDayList().size();
                     dayIndex++) {

                    DailyMealPlanDto day = plan.getDayList().get(dayIndex);

                    MealPlanDto meal = day.getMealList().stream()
                            .filter(item ->
                                    Integer.valueOf(currentMealFlag)
                                            .equals(item.getMealFlag())
                            )
                            .findFirst()
                            .orElse(null);

                    Cell cell = row.createCell(dayIndex + 1);
                    cell.setCellStyle(menuStyle);

                    if (meal == null) {
                        continue;
                    }

                    StringBuilder menuText = new StringBuilder();

                    for (MealRecipeAnalysisDto menu : meal.getMenuList()) {
                        if (menuText.length() > 0) {
                            menuText.append("\n");
                        }

                        menuText.append(menu.getReName());
                    }

                    cell.setCellValue(menuText.toString());
                }

                row.setHeightInPoints(110);
            }

            sheet.setColumnWidth(0, 10 * 256);

            for (int i = 1; i <= 7; i++) {
                sheet.setColumnWidth(i, 22 * 256);
            }

            sheet.createFreezePane(1, 1);

            workbook.write(outputStream);

            return outputStream.toByteArray();
        }
    }

    //엑셀 헤더 스타일
    private CellStyle createExcelHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();

        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setWrapText(true);

        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        setExcelBorder(style);

        Font font = workbook.createFont();
        font.setBold(true);

        style.setFont(font);

        return style;
    }

    //엑셀 끼니 스타일
    private CellStyle createExcelMealStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();

        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);

        setExcelBorder(style);

        Font font = workbook.createFont();
        font.setBold(true);

        style.setFont(font);

        return style;
    }

    //엑셀 메뉴 스타일
    private CellStyle createExcelMenuStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();

        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setWrapText(true);

        setExcelBorder(style);

        return style;
    }

    //엑셀 테두리
    private void setExcelBorder(CellStyle style) {
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
    }
}