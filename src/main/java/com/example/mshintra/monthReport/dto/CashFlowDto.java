package com.example.mshintra.monthReport.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CashFlowDto {

    private String ccCode;
    private String ccName;

    private BigDecimal amt1;
    private BigDecimal amt2;
    private BigDecimal amt3;
    private BigDecimal amt4;
    private BigDecimal amt5;
    private BigDecimal amt6;
    private BigDecimal amt7;
    private BigDecimal amt8;
    private BigDecimal amt9;
    private BigDecimal amt10;
    private BigDecimal amt11;
    private BigDecimal amt12;

    private BigDecimal amt00;
    private BigDecimal amt20;
    private BigDecimal amt21;

    private Integer flag;
}