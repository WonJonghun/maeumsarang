package com.example.mshintra.profile.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PassChangeDto {

    private String oldPassword;
    private String newPassword;
    private String newPasswordConfirm;
}