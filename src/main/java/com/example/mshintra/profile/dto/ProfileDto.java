package com.example.mshintra.profile.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileDto {

    private Long ccCnt1;    // 결재대기문서
    private Long ccCnt2;    // 참석자사인
    private Long ccCnt11;   // 접수문서
    private Long ccCnt12;   // 접수문서(미확인)
    private Long ccCnt21;   // 등기
    private Long ccCnt22;   // 등기(미확인)
    private Long ccCnt31;   // 택배
    private Long ccCnt32;   // 택배(미확인)
    private Long ccCnt99;   // 메일(미열람)
    private Long ccCnt111;  // 결재진행중
}
