package com.example.mshintra.security;

import com.example.mshintra.login.dto.LoginRequestDto;
import com.example.mshintra.login.dto.LoginUserDto;
import com.example.mshintra.login.mapper.LoginMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.List;

@RequiredArgsConstructor
@Component
public class LoginAuthenticationProvider implements AuthenticationProvider {

    private final LoginMapper loginMapper;

    // 로그인 인증
    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String loginId = authentication.getName();
        String loginPw = (String) authentication.getCredentials();

        LoginRequestDto req = new LoginRequestDto();
        req.setLoginId(loginId);
        req.setLoginPw(loginPw);

        LoginUserDto user = loginMapper.selectLoginUser(req);
        if (user == null) throw new BadCredentialsException("아이디 또는 비밀번호를 확인해 주세요.");

        return new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
    }
}
