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
public class WeeklyMealPlanDto {

    private LocalDate startDate;
    private LocalDate endDate;

    @Builder.Default
    private List<DailyMealPlanDto> dayList = new ArrayList<>();
}