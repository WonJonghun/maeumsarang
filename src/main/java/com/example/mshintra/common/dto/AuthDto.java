package com.example.mshintra.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthDto implements Serializable {

    private static final long serialVersionUID = 1L;

    private String winCode;   // data-win-code
    private String winName;   // data-win-name
    private String baseKey;   // Ml_BaseKey (Door)
    private String userId;    // Ic_code
    private String adminKey;  // dbo.Get_AdminKey 결과(권한7자리 + 메뉴명)
    private String menuName;  // 메뉴명
}
