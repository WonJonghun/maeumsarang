package com.example.mshintra.notice.dto;

import com.example.mshintra.common.dto.SearchDto;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PcNoticeSearchDto extends SearchDto {
    private int tnFlag;
    private String tnSeflag;
    private boolean libraryAll;
    private String searchType = "titleContent";
    private String tvUk;
}
