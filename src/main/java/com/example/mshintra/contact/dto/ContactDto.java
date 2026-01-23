package com.example.mshintra.contact.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactDto {

    private String icName;       //이름
    private String icCode;       //사번
    private LocalDate icIndate;  //입사일
    private String icSaflag;     //상태
    private String icHomephone;  // 집전화
    private String icPbdongho;   // 동호수
    private String icGunmu;      // 근무상태
    private String icHPphone;    // 휴대폰
    private String icBuser;      // 부서코드
    private String icBuserNm;    // 부서명
    private String icJikgub;     // 직급명
    private String icJikgub1;    // 직급코드
    private String icJikchek;    // 직책코드
    private String icJik3;       // 직책/분류명
    private String icSaphone;    // 내선
    private String icPEmail;     // 이메일
    private String ccPic;        // 사진경로
    private String icBodySize;   // 신체치수
    private String icPayFlag;    // 급여플래그
    private String icJobSebu;    // 세부값
}
