package com.example.mshintra.vacation.dto;

import com.example.mshintra.common.dto.SearchDto;
import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VacationDto extends SearchDto {

    private String ccCode;     // 사번
    private String ccName;     // 성명
    private String ccInDt;     // 입사일
    private String ccBaseDt;   // 기준일자
    private String ccBuser;    // 부서
    private String ccJikGub;   // 직급
    private String ccJikChek;  // 직책
    private float flag11;
    private float flag12;
    private float flag21;     // 발생연차
    private float flag21_1;
    private float flag22;     // 사용연차
    private float flag30;
    private float flag40;
    private float flag50;
    private float flag60;
    private float flag00;
    private float janoff;     // 잔여휴가
    private float changeJan;  // 실잔여휴가
    private String ccOutDt;    // 퇴사일
    private String ccAmt;      // 금액
    private String ccPayDay;   // 지급일
    private String ccDay;      // 일수
    private String ccDD;       // 일자
    private String ccTime;     // 시간
    private String ccDayTime;  // 근무시간

}
