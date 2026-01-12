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
}
