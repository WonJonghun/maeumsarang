package com.example.mshintra.foodMenu.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MealPlanValidationItemDto {

    private LocalDate date;
    private Integer mealFlag;
    private String ruleCode;
    private String reCode;
    private String message;
}