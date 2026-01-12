package com.example.mshintra.login.service;

import com.example.mshintra.login.dto.LoginRequestDto;
import com.example.mshintra.login.dto.LoginUserDto;
import com.example.mshintra.login.mapper.LoginMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class LoginService {

    private final LoginMapper loginMapper;

    public LoginUserDto login(LoginRequestDto loginRequestDto) {
        return loginMapper.selectLoginUser(loginRequestDto);
    }
}
