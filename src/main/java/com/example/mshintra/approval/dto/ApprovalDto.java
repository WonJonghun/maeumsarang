package com.example.mshintra.approval.dto;

import com.example.mshintra.common.dto.SearchDto;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalDto extends SearchDto {

    private String ccCode;        // 문서코드
    private String ccName;        // 문서명
    private String ccFlag;        // 문서구분
    private String ccFgNm;        // 구분명
    private String ccDate;        // 작성일
    private String ccDay;         // 요일
    private String ccTitle;       // 제목
    private Integer ccSignCnt;    // 결재자 수
    private String ccSign1;       // 결재자1 코드
    private String ccSignTt1;     // 결재자1 표시명
    private Integer ccSignOK1;    // 결재자1 결재여부(0/1)
    private String ccSign2;       // 결재자2 코드
    private String ccSignTt2;     // 결재자2 표시명
    private Integer ccSignOK2;    // 결재자2 결재여부(0/1)
    private String ccSign3;       // 결재자3 코드
    private String ccSignTt3;     // 결재자3 표시명
    private Integer ccSignOK3;    // 결재자3 결재여부(0/1)
    private String ccSign4;       // 결재자4 코드
    private String ccSignTt4;     // 결재자4 표시명
    private Integer ccSignOK4;    // 결재자4 결재여부(0/1)
    private String ccSign5;       // 결재자5 코드
    private String ccSignTt5;     // 결재자5 표시명
    private Integer ccSignOK5;    // 결재자5 결재여부(0/1)
    private String ccSign6;       // 결재자6 코드
    private String ccSignTt6;     // 결재자6 표시명
    private Integer ccSignOK6;    // 결재자6 결재여부(0/1)
    private String ccSign7;       // 결재자7 코드
    private String ccSignTt7;     // 결재자7 표시명
    private Integer ccSignOK7;    // 결재자7 결재여부(0/1)
    private String ccSign8;       // 결재자8 코드
    private String ccSignTt8;     // 결재자8 표시명
    private Integer ccSignOK8;    // 결재자8 결재여부(0/1)
    private String ccReSign;      // 반려자(또는 반려관련 코드)
    private String ccRMK;         // 비고
    private String ccReRMK;       // 반려사유
    private String ccReSignDt;    // 반려일시
    private String ccImgNO;       // 이미지번호1
    private String ccBuser;       // 부서 코드
    private String ccBuserNm;     // 부서명
    private Integer ccSRDFg;      // 문서양식
    private Integer ccLevel;      // 결재 단계(1~8)
    private Integer ccFg;         // 결재구분(1=1차,2=그외)
    private Integer ccPlseq;
    private String ccRMK1;        // 추가비고
    private Integer ccOK;         // 서명된 수
    private Integer ccOK1;        // 결재완료여부(0/1)
    private Integer ccOK_2;
    private String ccUse;         // 사용여부(기본 Y)
    private String ccForm;        // 양식코드(Hc_Code1)
    private String ccImgNO2;      // 이미지번호2
    private String ccSeFg;        // 참조/구분
    private Integer ccSignOR;     // 참석자사인 수
    private Integer ccSo1;        // 참석자 사인요청 여부(0/1)
    private String fcNum;         // 문서번호
    private Integer ccSeq;         // 서식번호
}
