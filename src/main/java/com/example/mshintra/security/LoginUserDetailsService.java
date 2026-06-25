package com.example.mshintra.security;

import com.example.mshintra.login.dto.LoginUserDto;
import com.example.mshintra.login.mapper.LoginMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class LoginUserDetailsService implements UserDetailsService {

    private final LoginMapper loginMapper;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        LoginUserDto user = loginMapper.selectLoginUserById(username);

        if (user == null) {
            throw new UsernameNotFoundException("사용자 정보를 찾을 수 없습니다.");
        }

        return user;
    }
}