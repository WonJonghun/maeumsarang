package com.example.mshintra.schedule.dto;

import com.example.mshintra.common.dto.SearchDto;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SatScheduleDto extends SearchDto {

    private String guDate;     // 날짜
    private String ccDay;      // 요일
    private String ccBuser;    // 부서
    private String ccName;     // 이름
    private String guFlag;     // 근무
    private String ccInTime;   // 출근
}