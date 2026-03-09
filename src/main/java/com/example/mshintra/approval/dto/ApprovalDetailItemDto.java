package com.example.mshintra.approval.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalDetailItemDto {

    private Integer seq;        // 10, 20, 30...
    private String title;       // 라벨
    private String value;       // 값
    private String font;
    private String fontBold;
    private String fontColor;
}