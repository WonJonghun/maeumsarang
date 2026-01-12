package com.example.mshintra.notice.dto;

import com.example.mshintra.common.dto.SearchDto;
import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticeDto extends SearchDto {

    // tnFlag,tnSeflag 위주로 확인
    private String tnDate;          // 날짜시간
    private int tnFlag;             // 대분류
    private String tnDateStr;       // 화면 표시용날짜
    private String hcCode;          // 대분류명
    private int tnAflag;            // 소분류
    private String tnSeq;           // 일련번호(4)
    private String tnTime;          // 시간(HHmm)
    private String tnTitle;         // 제목
    private String tnRemark;        // 내용
    private String tnPassward;      // 비밀번호
    private String tnUk;            // 작성팀
    private String tnDelFlag;       // 삭제여부(Y/N)
    private String tnPopupFlag;     // 팝업공지여부(Y/N)
    private String tnCount;
    private String tnPlanFlag;      // 일정여부(Y/N)
    private String tnPlanDate;      // 일정일시
    private String tnSeflag;        // 세부구분(3)
    private String tnTop;           // 상단고정
    private String tnImgNum;        // 이미지번호
    private String tnRegDate;       // 등록일시
    private String tnUserId;        // 작성자ID
    private String icName;          // 작성자명
    private String tnModDt;         // 수정일시
    private String tnModUid;        // 수정자ID
    private String hcName;          // 대분류명
    private String buserNm;         // 부서명
    private String viewCount;       // 조회수
    private String tvUk;            // 게시글 일련번호 (Tn_Flag + CONVERT(CHAR(8), Tn_Date, 112) + Tn_AFlag +Tn_Seq)
    private String ccView;          // 조회여부YN

}
