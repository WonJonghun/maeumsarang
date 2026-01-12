package com.example.mshintra.login.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequestDto {
    private String loginId;  // 아이디
    private String loginPw;  // 비밀번호
}
