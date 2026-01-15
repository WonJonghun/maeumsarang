package com.example.mshintra.repair.dto;

import com.example.mshintra.common.dto.SearchDto;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RepairDto extends SearchDto {

    private LocalDate rpDate;           // 신청일
    private Integer rpNumber;           // 일련번호
    private Integer rpFlag;
    private Integer rpSeFlag;           // 수리구분코드
    private String seFlagNm;            // 수리구분명
    private Integer rpBuser;            // 부서 코드
    private String buserNm;             // 부서명
    private String rpOrRemark;          // 신청내용
    private Integer rpSaFlag;
    private String rpUserId;            // 신청자 ID
    private String userNm;              // 신청자명
    private String rpSign1;
    private String rpReUserId;          // 접수자 ID
    private String reUserNm;            // 접수자명
    private LocalDate rpReDate;         // 처리일
    private String rpJobUserId;         // 작업자 ID
    private String jobUserNm;           // 작업자 ID
    private String rpReRemark;          // 처리내용
    private Integer rpReFlag;
    private Integer ccReFlag;
    private LocalDateTime rpExDate;
    private String rpExUserId;
    private String rpSign2;
    private LocalDateTime rpRegDate;    // 등록일시
    private String rpImgNum;            // 첨부 이미지 번호
}
