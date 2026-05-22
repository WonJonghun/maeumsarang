package com.example.mshintra.mail.dto;

import com.example.mshintra.common.dto.SearchDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MailListDto extends SearchDto {

    private Integer delflag;
    private Integer flag;
    private Integer flag1;
    private Integer chk;
    private Integer ccFlag;

    private LocalDate maDate;
    private String maSeq;
    private String icName;
    private String maReceiveId;
    private String maTime;
    private String maTitle;
    private String maRemark;
    private String maUk;
    private String maDelFlag;
    private String maView;
    private String maFileFlag;
    private String maImgNum;
    private LocalDateTime maRegDate;
    private String maUserId;
    private String maDelFlag1;
}