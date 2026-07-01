package com.example.mshintra.customer.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerDto {

    private String cnt1;      // 재원환자수
    private String cnt2;      // 입원환자수(월)
    private String cnt3;      // 퇴원환자수(월)
    private String cnt4;      // 입원환자수(일)
    private String cnt5;      // 퇴원환자수(일)
    private String cnt6;      // 일평균환자수
    private String cnt7;      // 환자연인원
    private String baseDt;    // 기준일자
    private String ccJangBi;
    private String cnt8;      // 외래접수
    private String cnt9;      // 진료완료

    private String srTo;      // 허가병상
    private String emergencyCnt; // 응급 재원환자수
}