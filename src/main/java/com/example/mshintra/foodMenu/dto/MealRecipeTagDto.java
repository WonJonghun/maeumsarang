package com.example.mshintra.foodMenu.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MealRecipeTagDto {

    private String reCode;       // 메뉴코드
    private Integer reFlag;      // 메뉴구분
    private String reName;       // 메뉴명
    private String reRemark;     // 조리방법

    private String fcCode;       // 식재료코드
    private String fcName;       // 식재료명
    private Double rcServSize1;  // 아침 사용량
    private Double rcServSize2;  // 점심 사용량
    private Double rcServSize3;  // 저녁 사용량

    private String tagCode;      // 태그코드
    private String tagType;      // 태그구분
    private String tagName;      // 태그명
}