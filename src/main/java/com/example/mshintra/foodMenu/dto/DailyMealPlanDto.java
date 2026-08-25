package com.example.mshintra.foodMenu.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyMealPlanDto {

    private LocalDate date;
    private String dayName;

    @Builder.Default
    private List<MealPlanDto> mealList = new ArrayList<>();
}