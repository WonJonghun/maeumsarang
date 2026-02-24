package com.example.mshintra.profile.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileDto {

    private int ccCnt1;    // 결재대기문서
    private int ccCnt2;    // 참석자사인
    private int ccCnt11;   // 접수문서
    private int ccCnt12;   // 접수문서(미확인)
    private int ccCnt21;   // 등기
    private int ccCnt22;   // 등기(미확인)
    private int ccCnt31;   // 택배
    private int ccCnt32;   // 택배(미확인)
    private int ccCnt99;   // 메일(미열람)
    private int ccCnt111;  // 결재진행중
}
