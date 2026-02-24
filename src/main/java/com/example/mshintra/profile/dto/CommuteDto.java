package com.example.mshintra.profile.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommuteDto {

    private String ilDate;     // 일자
    private String ilDay;      // 요일
    private String ilCode;     // 사번/코드
    private String ilBuser;    // 부서
    private String ilGunFlag;  // 구분플래그
    private String ilIntime;   // 출근시간
    private String ilOuttime;  // 퇴근시간
    private String ilFlag;     // 상태플래그
    private String ilInPc;     // 입실PC
    private String ilOutPc;    // 퇴실PC
    private String ilRemark;   // 비고
    private String ilRegDate;  // 등록일시
    private String ilUserId;   // 등록자
}
