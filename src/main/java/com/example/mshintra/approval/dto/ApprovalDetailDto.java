package com.example.mshintra.approval.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalDetailDto {

    private String ccCode;        // 문서코드
    private String ccFlag;        // 구분(Flag)
    private String ccSeFg;        // 서식구분
    private String ccDate;        // 작성/신청일자
    private String ccBuser;       // 부서(또는 작성부서)
    private Integer ccSignCnt;    // 결재자수

    private String ccSign1;       // 결재1
    private String ccSignDt1;     // 결재1일시
    private String ccSignTt1;     // 결재1직책
    private String ccSign2;       // 결재2
    private String ccSignDt2;     // 결재2일시
    private String ccSignTt2;     // 결재2직책
    private String ccSign3;       // 결재3
    private String ccSignDt3;     // 결재3일시
    private String ccSignTt3;     // 결재3직책
    private String ccSign4;       // 결재4
    private String ccSignDt4;     // 결재4일시
    private String ccSignTt4;     // 결재4직책
    private String ccSign5;       // 결재5
    private String ccSignDt5;     // 결재5일시
    private String ccSignTt5;     // 결재5직책
    private String ccSign6;       // 결재6
    private String ccSignDt6;     // 결재6일시
    private String ccSignTt6;     // 결재6직책
    private String ccSign7;       // 결재7
    private String ccSignDt7;     // 결재7일시
    private String ccSignTt7;     // 결재7직책
    private String ccSign8;       // 결재8
    private String ccSignDt8;     // 결재8일시
    private String ccSignTt8;     // 결재8직책

    private String ccUk;          // UK(+RMK 결합값)
    private String ccImgNo;       // 이미지번호
    private String ccRmk;         // 비고

    // #aaa 반복영역
    private String ccSeq10;       // 항목Seq(10)
    private String ccTitle10;     // 항목제목(10)
    private String ccRmk10;       // 항목내용(10)
    private String ccFont10;      // 폰트(10)
    private String ccFontBold10;  // 폰트Bold(10)
    private String ccFontColor10; // 폰트색/값(10)

    // 휴가신청서(OF)
    private String ccSeq20;       // 항목Seq(20, OF전용)
    private String ccTitle20;     // 휴가종류(OF, @2~@3 파싱)
    private String ccRmk20;       // 항목내용(20)
    private String ccFont20;      // 폰트(20)
    private String ccFontBold20;  // 폰트Bold(20)
    private String ccFontColor20; // 폰트색(20)

    private String ccSeq30;       // 항목Seq(30, OF전용)
    private String ccTitle30;     // 시작일(OF, @3~@4 파싱)
    private String ccRmk30;       // 항목내용(30)
    private String ccFont30;      // 폰트(30)
    private String ccFontBold30;  // 폰트Bold(30)
    private String ccFontColor30; // 폰트색(30)

    private String ccSeq40;       // 항목Seq(40, OF전용)
    private String ccTitle40;     // 종료일(OF, @4~@0 파싱)
    private String ccRmk40;       // 휴가명(dbo.GetOffDayNM)
    private String ccFont40;      // 폰트(40)
    private String ccFontBold40;  // 폰트Bold(40)
    private String ccFontColor40; // 폰트색(40)

    // 사인 url 말고 af_num 원본
    private String esSign1;
    private String esSign2;
    private String esSign3;
    private String esSign4;
    private String esSign5;
    private String esSign6;
    private String esSign7;
    private String esSign8;

    private List<ApprovalDetailItemDto> items;
}
