package com.example.mshintra.login.mapper;

import com.example.mshintra.login.dto.LoginRequestDto;
import com.example.mshintra.login.dto.LoginUserDto;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface LoginMapper {

    LoginUserDto selectLoginUser(LoginRequestDto param);
}
