package com.example.mshintra.schedule.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleDto {

    private String icBuser;     // 부서
    private String icBuserNm;   // 부서명
    private String icJikgub;    // 직급
    private String icJikgubNm;  // 직급명
    private String icCode;      // 코드
    private String icName;      // 성명
    private String ccGunmu;     // 근무형태

    // 일자
    private String a1;
    private String a2;
    private String a3;
    private String a4;
    private String a5;
    private String a6;
    private String a7;
    private String a8;
    private String a9;
    private String a10;
    private String a11;
    private String a12;
    private String a13;
    private String a14;
    private String a15;
    private String a16;
    private String a17;
    private String a18;
    private String a19;
    private String a20;
    private String a21;
    private String a22;
    private String a23;
    private String a24;
    private String a25;
    private String a26;
    private String a27;
    private String a28;
    private String a29;
    private String a30;
    private String a31;

    public String getDayValue(int day) {
        if (day < 1 || day > 31) return null;
        String[] days = {a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13,a14,a15,a16,a17,a18,a19,a20,a21,a22,a23,a24,a25,a26,a27,a28,a29,a30,a31};
        return days[day - 1];
    }
}
