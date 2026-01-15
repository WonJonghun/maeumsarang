package com.example.mshintra.imprvprop.dto;

import com.example.mshintra.common.dto.SearchDto;
import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImprvPropDto extends SearchDto {

    private String plDate;
    private String plNumber;
    private String plTitle;
    private String plFlag;
    private String plFileFlag;
    private String plFileName;
    private String plImgNum;
    private String plGub;
    private String plBuser;
    private String plSilbuser;
    private String plPartflag;  //1제안 2개선
    private String plBflag;
    private String plRegDate;
    private String plUserId;
    private String icCode;
}
