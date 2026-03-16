package com.example.mshintra.common.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HelpCodeDto {

    private String hcCode;
    private int hcSeq;
    private String hcName;
    private String hcRmk;
    private String hcColumNm;
    private String hcFilter;
    private String hcSqlFg;
    private String hcSql;
    private String hcRatio;
    private String hcCode1;
    private String hcUpFlag;
    private String hcRegDt;
}