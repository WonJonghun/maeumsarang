package com.example.mshintra.login.service;

import com.example.mshintra.login.dto.LoginRequestDto;
import com.example.mshintra.login.dto.LoginUserDto;
import com.example.mshintra.login.mapper.LoginMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class LoginService {

    private final LoginMapper loginMapper;

    @Value("${security.decrypt.key}")
    private String securityDecryptKey;

    public LoginUserDto login(LoginRequestDto loginRequestDto) {
        return loginMapper.selectLoginUser(loginRequestDto, securityDecryptKey);
    }

    public LoginUserDto selectLoginUserById(String loginId) {
        return loginMapper.selectLoginUserById(loginId, securityDecryptKey);
    }
}
