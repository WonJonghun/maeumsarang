package com.example.mshintra.notice.dto;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PcNoticeMenuDto {
    private String ccBaseKey;
    private String ccMenuName;
    @Builder.Default
    private String tnSeflag = "";
    private boolean libraryAll;
    @Builder.Default
    private List<PcNoticeMenuDto> children = new ArrayList<>();
}
