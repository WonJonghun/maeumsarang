package com.example.mshintra.notice.dto;

import com.example.mshintra.common.dto.SearchDto;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticeMenuDto extends SearchDto {

    // hcCode,hcColumNm 위주로 확인
    private String hcCode;        // 코드값, IntGmenu 공지코드
    private int hcSeq;            // 순번
    private String hcName;        // 표시명
    private String hcRmk;         // 설명
    private String hcColumNm;     // 하위코드 Int000042~45
    private String hcFilter;
    private String hcSqlFg;
    private String hcSql;
    private String hcRatio;
    private String hcCode1;
    private String hcUpFlag;
    private String hcRegDt; // 등록일시

    @Builder.Default
    private List<NoticeMenuDto> subMenuList = new ArrayList<>();    //하위메뉴리스트
}
