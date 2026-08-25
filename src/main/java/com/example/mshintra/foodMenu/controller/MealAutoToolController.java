package com.example.mshintra.foodMenu.controller;

import com.example.mshintra.foodMenu.dto.MealPlanValidationDto;
import com.example.mshintra.foodMenu.dto.MealRecipeAnalysisDto;
import com.example.mshintra.foodMenu.dto.MealRecipeTagDto;
import com.example.mshintra.foodMenu.dto.WeeklyMealPlanDto;
import com.example.mshintra.foodMenu.service.MealAutoToolService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Controller
@RequestMapping("/foodMenu")
public class MealAutoToolController {

    private final MealAutoToolService mealAutoToolService;

    @GetMapping("/mealAutoTool.do")
    public String mealAutoTool() {
        return "jsp/foodMenu/mealAutoTool";
    }

    @ResponseBody
    @GetMapping("/selectRecipeTagList.do")
    public List<MealRecipeTagDto> selectRecipeTagList(String reCode) {
        return mealAutoToolService.selectRecipeTagList(reCode);
    }

    @ResponseBody
    @GetMapping("/selectRecipeAnalysis.do")
    public MealRecipeAnalysisDto selectRecipeAnalysis(String reCode) {
        return mealAutoToolService.selectRecipeAnalysis(reCode);
    }

    @ResponseBody
    @GetMapping("/selectRecipeAnalysisList.do")
    public List<MealRecipeAnalysisDto> selectRecipeAnalysisList() {
        return mealAutoToolService.selectRecipeAnalysisList();
    }

    @ResponseBody
    @GetMapping("/selectRecipePool.do")
    public Map<Integer, List<MealRecipeAnalysisDto>> selectRecipePool() {
        return mealAutoToolService.selectRecipePool();
    }

    @ResponseBody
    @GetMapping("/createWeeklyMealPlan.do")
    public WeeklyMealPlanDto createWeeklyMealPlan(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate) {

        return mealAutoToolService.createWeeklyMealPlan(startDate);
    }

    @ResponseBody
    @GetMapping("/validateWeeklyMealPlan.do")
    public MealPlanValidationDto validateWeeklyMealPlan(
            @RequestParam
            @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate) {

        return mealAutoToolService.validateGeneratedWeeklyMealPlan(startDate);
    }

    @PostMapping("/downloadWeeklyMealPlanExcel.do")
    public void downloadWeeklyMealPlanExcel(
            @RequestBody WeeklyMealPlanDto weeklyMealPlan,
            HttpServletResponse response) throws IOException {

        byte[] excel = mealAutoToolService.createWeeklyMealPlanExcel(weeklyMealPlan);

        response.setContentType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        response.setHeader(
                "Content-Disposition",
                "attachment; filename=\"weeklyMealPlan.xlsx\""
        );
        response.setContentLength(excel.length);

        response.getOutputStream().write(excel);
        response.getOutputStream().flush();
    }
}