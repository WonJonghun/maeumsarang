package com.example.mshintra.itemrequest.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ItemRequestDetailDto {

    private String orComCD;       // 회사코드
    private String orDate;        // 신청일자
    private String orNumber;      // 신청번호
    private String orSeq;         // 순번
    private String orFlag;        // 구분
    private String orBuser;       // 사용자코드
    private String orPrcode;      // 처방코드
    private String orOccode;      // 오더코드
    private String orReSaCD;      // 재료코드
    private String orReDt;        // 관련일자
    private String orEmFlag;      // 응급여부
    private String orDirect;      // 직접여부
    private String orPrevqty;     // 이전수량
    private String orPrevPrice;   // 이전단가
    private String orQty;         // 수량
    private String orPrice;       // 단가
    private String orRemark;      // 비고
    private String orOrderDate;   // 오더일자
    private String orCancel;      // 취소여부
    private String orInDate;      // 입고일자
    private String orInNumber;    // 입고번호
    private String orInqty;       // 입고수량
    private String orInPrice;     // 입고단가
    private String orOutDate;     // 출고일자
    private String orOutqty;      // 출고수량
    private String orOutPrice;    // 출고단가
    private String orDeptCD;      // 부서코드
    private String orChtNo;       // 차트번호
    private String orIoRemark;    // 입출고비고
    private String orUK;          // UK
    private String orElecUK;      // 전자UK
    private String orImgNum;      // 이미지번호
    private String orUserID;      // 사용자ID
    private String orRegDate;     // 등록일시
    private String orModUID;      // 수정자ID
    private String orModDt;       // 수정일시

    private String ocName;        // 코드명
    private String ocStanSize;    // 규격
    private String ocUnit;        // 단위
    private String ocComPany;     // 회사명
    private String ocInscode;     // 보험코드

    private String ccPrcode;      // 처방코드
    private String ccPaNM;        // 환자명
}