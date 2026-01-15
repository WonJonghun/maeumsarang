package com.example.mshintra.common.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class SearchDto {

    private String searchKeyword;   // 검색키워드
    private Integer offset;         // 갯수
    private Integer limit;          // 부터 시작
    private String searchBuserCd;   // 부서코드
    private String searchDate;      // 일자
    private String searchId;        // 유저Id
    private String searchFromDate;  // 시작일
    private String searchToDate;    // 종료일
}
