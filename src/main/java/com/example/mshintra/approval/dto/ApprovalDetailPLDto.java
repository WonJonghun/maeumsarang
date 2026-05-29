package com.example.mshintra.approval.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalDetailPLDto {

    private String ccCode;
    private String ccFlag;
    private String ccFgNm;
    private String ccDate;
    private String ccDay;

    private String ccTitle;
    private String ccRmk;

    private String ccPlace;
    private String ccPaperNo;
    private String ccReDate;
    private String ccReCD;
    private String ccReSaCD;
    private String ccReBuserNm;
    private String ccReSaNm;
    private String ccManagerNm;

    private String ccImgNO;
    private String ccBuser;
    private Integer ccSeq;
    private Integer ccPlseq;
    private String fcNum;

    private Integer ccSignCnt;
    private String ccSign1;
    private Integer ccSignOK1;
    private Integer ccOK;
    private Integer ccOK1;

    private String ccReSign;
    private String ccReRMK;
    private String ccReSignDt;
    private String ccUse;
}