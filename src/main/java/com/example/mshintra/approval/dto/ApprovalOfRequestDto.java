package com.example.mshintra.approval.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApprovalOfRequestDto {

    private String startDate;
    private String endDate;
    private String leaveType;
    private String timeType;
    private String dayCount;
    private String reason;
}