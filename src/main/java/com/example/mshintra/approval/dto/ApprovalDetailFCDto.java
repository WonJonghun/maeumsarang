package com.example.mshintra.approval.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalDetailFCDto extends ApprovalDetailDto {

    private String ccTitle;      // 제목
    private String ccRmk;        // 내용/비고
    private String ccColumNm;    // 원본 컬럼명
    private Integer ccSeq;       // 순번
    private String ccFlag;       // 플래그
    private String ccFilter;     // 출력구분
    private String ccHubJo;      // 협조자
    private String ccNum;        // 시행문서번호
    private String ccDate;       // 시행일자
    private String ccAddr;       // 주소
    private String ccPhone;      // 번호
}