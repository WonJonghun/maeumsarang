package com.example.mshintra.login.mapper;

import com.example.mshintra.login.dto.LoginRequestDto;
import com.example.mshintra.login.dto.LoginUserDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface LoginMapper {

    LoginUserDto selectLoginUser(@Param("param") LoginRequestDto param,
                                @Param("securityDecryptKey") String securityDecryptKey);

    LoginUserDto selectLoginUserById(@Param("loginId") String loginId,
                                    @Param("securityDecryptKey") String securityDecryptKey);
}
