package com.example.mshintra.schedule.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleMenuDto {

    private String baseDt;      // 이번달 시작일
    private int flagCd;         // 직종코드 1=간호부, 2=조리사, 7=의사, 9=직원
    private String menuNm;      // 메뉴명
    private String saCd;        // 사번
}
