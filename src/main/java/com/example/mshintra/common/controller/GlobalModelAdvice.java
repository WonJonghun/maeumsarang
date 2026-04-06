package com.example.mshintra.common.controller;

import com.example.mshintra.common.dto.MenuAuthDto;
import com.example.mshintra.login.dto.LoginUserDto;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

@ControllerAdvice
public class GlobalModelAdvice {

    @ModelAttribute("user")
    public LoginUserDto user(@AuthenticationPrincipal LoginUserDto loginUser) { return loginUser; }

    @ModelAttribute("menuAuth")
    public MenuAuthDto menuAuth(HttpSession session) {
        Object o = (session == null ? null : session.getAttribute("menuAuth"));
        return (o instanceof MenuAuthDto) ? (MenuAuthDto) o : null;
    }
}
