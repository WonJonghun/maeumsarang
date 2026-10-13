package com.example.mshintra.main.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MainOutDutyDto {

    private String ccFlag;    //진료 시간
    private String ccCode;    //사번
    private String ccName;    //진료자명
    private String ccDeptCd;  //진료과 코드
}
