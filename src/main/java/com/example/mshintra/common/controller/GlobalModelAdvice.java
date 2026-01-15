package com.example.mshintra.common.controller;

import com.example.mshintra.common.dto.AuthDto;
import com.example.mshintra.login.dto.LoginUserDto;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

@ControllerAdvice
public class GlobalModelAdvice {

    @ModelAttribute("user")
    public LoginUserDto user(@AuthenticationPrincipal LoginUserDto loginUser) { return loginUser; }

    @ModelAttribute("cmAuth")
    public AuthDto cmAuth(HttpSession session) {
        Object o = (session == null ? null : session.getAttribute("CM_AUTH"));
        return (o instanceof AuthDto) ? (AuthDto) o : null;
    }
}
