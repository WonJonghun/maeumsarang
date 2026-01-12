package com.example.mshintra.schedule.dto;

import com.example.mshintra.common.dto.SearchDto;
import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalendarDto extends SearchDto {

    private String ccTime;
    private String ccRmk;
    private String ccBuser;
    private String userId;
}
