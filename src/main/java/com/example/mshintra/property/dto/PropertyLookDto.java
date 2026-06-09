package com.example.mshintra.property.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PropertyLookDto {

    private Integer chk;          // 조사여부

    private String ppArea;        // 관리장소코드
    private String ppAreaNm;      // 관리장소명
    private String ocFlag;        // 구분코드
    private String ocFlagNm;      // 구분명
    private String ppOccode;      // 품목코드
    private String ppOcName;      // 품목명
    private String ppOccodeNm;    // 품목명
    private String ppSecode;      // 세부코드
    private String ppSecode1;     // 세부명
    private String ppSeName;      // 상세명칭
    private String ppModel;       // 모델
    private String ppStanSize;    // 규격
    private String ppDate1;       // 구입일
    private String ppDate2;       // 폐기일
    private Integer ppQty;        // 수량

    private String ppCode;
    private String ppGuFlag;
    private Integer ppAmount;
    private String ppYear;
    private Integer ppAmt1;
    private Integer ppAmt2;
    private String ppSerial;
    private String ppPrcode;
    private String ppPrName;
    private String ppBuser;
    private String ppBuserNm;
    private String ppSaCode;
    private String ppSaNm;
    private String ppBaCode;
    private String ppUseFlag;
    private String ppUkFlag;
    private String ppUK;
    private String ppImgNum;
    private String ccImg;
    private String ppRemark;
    private String ppRegDate;
    private String ppUserID;

    private String ccDate0;
    private String ccSaCD0;
    private String ccDate1;
    private String ccSaCD1;
    private String ccDate2;
    private String ccSaCD2;
    private String ccDate3;
    private String ccSaCD3;
    private String ccDate4;
    private String ccSaCD4;
}