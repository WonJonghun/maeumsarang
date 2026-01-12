package com.example.mshintra.schedule.dto;

import com.example.mshintra.common.dto.SearchDto;
import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DayDutyDto extends SearchDto {

    private String hcName;  //당직타이틀
    private String duName;  //당직자명
}
