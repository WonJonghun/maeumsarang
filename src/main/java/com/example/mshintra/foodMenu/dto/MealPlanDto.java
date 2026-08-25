package com.example.mshintra.foodMenu.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MealPlanDto {

    private Integer mealFlag;
    private String mealName;

    @Builder.Default
    private List<MealRecipeAnalysisDto> menuList = new ArrayList<>();
}