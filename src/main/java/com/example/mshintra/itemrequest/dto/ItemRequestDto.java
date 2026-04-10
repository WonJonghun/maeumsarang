package com.example.mshintra.itemrequest.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ItemRequestDto {

    private String orComCD;      // 회사코드
    private String orDate;       // 신청일자
    private String orNumber;     // 신청번호
    private String orFlag;       // 상태구분
    private String OrFlagNm;     // 상태구분명
    private String orBuser;      // 부서코드
    private String orBuserNm;    // 부서명
    private String orReSaCD;     // 재작성자코드
    private String orReDt;       // 재작성일시
    private String orEmFlag;     // 전송여부

    private Integer cnt;         // 건수
    private Integer amt;         // 합계금액

    private String orRegDate;    // 등록일시
    private String orUserID;     // 사용자ID
    private String orElecUK;     // 전자결재키
    private String orChtNO;      // 차트번호
    private String orChtNM;      // 환자명
    private String orInNumber;   // 입원번호

    private String ccCode;       // 결재코드
    private String ccFlag;       // 결재구분
    private String ccDate;       // 결재일자
    private String ccTitle;      // 결재제목
    private Integer ccSignCnt;   // 결재선수
    private String ccSign1;      // 1차 결재자
    private Integer ccMyOK;      // 내결재여부
    private String ccImgNO;      // 이미지번호
    private String ccBuser;      // 결재부서
    private Integer ccSignOK;    // 결재선수값
    private Integer ccChk;       // 확인여부
    private Integer ccOK;        // 총 결재완료수

    private String ccSignTt1;    // 1차 결재표시명
    private String ccSignTt2;    // 2차 결재표시명
    private String ccSignTt3;    // 3차 결재표시명
    private String ccSignTt4;    // 4차 결재표시명
    private String ccSignTt5;    // 5차 결재표시명
    private String ccSignTt6;    // 6차 결재표시명
    private String ccSignTt7;    // 7차 결재표시명
    private String ccSignTt8;    // 8차 결재표시명

    private Integer chk;         // 체크값
}