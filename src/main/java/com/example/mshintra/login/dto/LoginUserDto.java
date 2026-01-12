package com.example.mshintra.login.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginUserDto {
    private String icCode;      // 사번
    private String icName;      // 이름
    private String icBuser;     // 부서코드
    private String ccBuser;     // 부서명
    private String afFilename;  // 사진명
    private byte[] afContent;   // 사진BLOB
    private int flag;        // 직종구분코드
}
