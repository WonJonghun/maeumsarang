package com.example.mshintra.schedule.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HolidayDto {

    private String ccDt;        //일자
    private String ccOffNm;     //공휴일명
    private String ccDtNm;      //요일
    private String ccDtNo;      //날짜순서
    private String year;        //년도
    private String month;       //달
    private String saCd;        //사번
    private int ccWeekendCd=1;  //주말포함 여부 0=포함, 1=미포함
}
