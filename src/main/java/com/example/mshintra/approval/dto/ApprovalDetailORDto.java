package com.example.mshintra.approval.dto;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ApprovalDetailORDto extends ApprovalDetailDto {

    private String orComCd;       // 회사코드
    private String orDate;        // 신청일자
    private String orNumber;      // 신청번호
    private String orSeq;         // 순번
    private String orFlag;        // 구분
    private String orBuser;       // 부서코드
    private String orPrcode;      // 환자코드
    private String orOccode;      // 물품코드
    private String orReSaCd;      // 재사용코드
    private String orReDt;        // 재사용일자
    private String orEmFlag;      // 응급여부
    private String orPrevqty;     // 이전수량
    private String orPrevPrice;   // 이전단가
    private String orQty;         // 수량
    private String orPrice;       // 단가
    private String orRemark;      // 비고
    private String orOrderDate;   // 발주일자
    private String orCancel;      // 취소여부
    private String orInDate;      // 입고일자
    private String orInNumber;    // 입고번호
    private String orInqty;       // 입고수량
    private String orInPrice;     // 입고단가
    private String orOutDate;     // 출고일자
    private String orOutqty;      // 출고수량
    private String orOutPrice;    // 출고단가
    private String orDeptCd;      // 부서코드
    private String orChtNo;       // 차트번호
    private String orIoRemark;    // 입출고비고
    private String orUk;          // 고유키
    private String orElecUk;      // 전자결재고유키
    private String orImgNum;      // 이미지번호
    private String orUserId;      // 등록사용자ID
    private String orRegDate;     // 등록일시
    private String orModUid;      // 수정사용자ID
    private String orModDt;       // 수정일시

    private String ocName;        // 물품명
    private String ocStanSize;    // 규격
    private String ocUnit;        // 단위
    private String ocComPany;     // 제조사
    private String ocInscode;

    private String ccPrcode;      // 환자코드
    private String ccPaNm;        // 환자명
}