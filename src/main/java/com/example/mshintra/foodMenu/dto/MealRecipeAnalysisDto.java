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
public class MealRecipeAnalysisDto {

    private String reCode;
    private Integer reFlag;
    private String reFlagName;
    private String reName;

    @Builder.Default
    private List<String> proteinTypes = new ArrayList<>();

    @Builder.Default
    private List<String> proteinDetails = new ArrayList<>();

    @Builder.Default
    private List<String> ingredientTags = new ArrayList<>();

    private String cookingType;
    private String processedYn;

    private String soupBase;
    private String redSoupYn;
    private String oneDishYn;
    private String noodleYn;
    private String menuPattern;
}