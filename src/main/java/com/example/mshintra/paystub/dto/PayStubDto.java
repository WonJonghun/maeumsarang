package com.example.mshintra.paystub.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PayStubDto {

    private String flag;              // 플래그
    private String pdCode;            // 사번
    private String pdYymm;            // 년월
    private String pdSaflag;
    private String pdFlag;            // 구분
    private String pdDate;            // 지급일자
    private String pdBuser;
    private String pdDd;

    private String pdOpay;            // 기본급
    private String pdObouns;          // 상여
    private String pdOfoodamt;        // 식대
    private String pdOcaramt;         // 차량지원금
    private String pdOgita01;
    private String pdOgita02;
    private String pdOgita03;
    private String pdOgita04;
    private String pdOgita05;
    private String pdOgita06;
    private String pdOgita07;
    private String pdOgita08;
    private String pdOgita09;
    private String pdOgita091;
    private String pdOgita10;
    private String pdOgita11;
    private String pdOgita12;
    private String pdOgita13;
    private String pdOgita14;
    private String pdOgita15;

    private String pdItax;            // 소득세
    private String pdIjumintax;       // 주민세
    private String pdIbohum;          // 보험
    private String pdIgukmin;         // 국민연금
    private String pdIgoyong;         // 고용보험
    private String pdIsangjo;
    private String pdIfoodamt;        // 식대 공제
    private String pdIgong01;
    private String pdIgong02;
    private String pdIgong03;

    private String pdRemark;          // 비고

    private String pdRegUid;          // 등록자
    private String pdRegDt;           // 등록일시
    private String pdRegIp;           // 등록IP
    private String pdModUid;          // 수정자
    private String pdModDt;           // 수정일시
    private String pdModIp;           // 수정IP

    private String ccHh;
    private String ccOgita01;
    private String ccOgita02;
    private String ccOgita03;
    private String ccOgita04;
    private String ccOgita05;
    private String ccOgita06;
    private String ccOgita07;
    private String ccOgita08;
    private String ccOgita09;
    private String ccOgita10;
    private String ccOgita11;
    private String ccOgita12;
    private String ccOgita13;
    private String ccOgita14;
    private String ccOgita15;

    private String arSDt;             // 시작일
    private String arEDt;             // 종료일
    private String arTotAmt;          // 총금액
    private String arArAmt;           // 압류금액
    private String arRmk;             // 압류비고

    private String ccLdate;           // 말일
    private String ccFormula;         // 계산식

    private String prRmk;             // 수당산정 기간
    private String icBankname;        // 계좌번호
}