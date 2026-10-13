package com.example.mshintra.main.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MainEmployeeDto {

    private String icCode;       //사번
    private String icName;       //이름
    private String icBuser;      //부서코드
    private String ccBuser;      //부서명
    private String icJikgubNm;   //직급명
    private String icJikchekNm;  //직군명
    private String icHpPhone;    //휴대폰
    private String icPEmail;     //이메일
    private String icSaphone;    //내선
    private int flag;            //근무조회 직종
}
