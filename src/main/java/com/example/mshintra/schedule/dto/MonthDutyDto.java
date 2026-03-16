package com.example.mshintra.schedule.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthDutyDto {

    private String duDate;      // 당직일자
    private String duFlag;      // 당직구분
    private String duCode1;     // 사번
    private String duName1;     // 이름
    private String hcName;      // 당직명
}