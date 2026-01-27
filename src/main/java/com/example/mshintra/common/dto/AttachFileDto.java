package com.example.mshintra.common.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttachFileDto {
    private String afNum;
    private int afSeq;
    private int afFlag;
    private String afFileName;     // 원본명
    private byte[] afContent;      // 파일
    private long afFileSize;
    private String afRegDate;
    private String afUserId;
    private String afSecurity;
    private String saveYear;       // NAS 폴더 계산용(yyyy)
    private String saveMonth;      // NAS 폴더 계산용(mm)
}
