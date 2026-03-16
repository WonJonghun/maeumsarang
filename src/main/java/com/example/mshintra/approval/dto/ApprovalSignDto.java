package com.example.mshintra.approval.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalSignDto {

    private Integer seq;
    private String signTitle;
    private String signDate;
    private String signNo;
}