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
public class MealAutoProcedureDto {

    private LocalDate useDate;
    private String dayName;
    private Integer mealFlag;
    private String mealName;
    private Integer menuSeq;
    private String reCode;
    private Integer reFlag;
    private String reName;
}