package com.example.mshintra.common.controller;

import com.example.mshintra.login.dto.LoginUserDto;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

@ControllerAdvice
public class GlobalModelAdvice {

    @ModelAttribute("user")
    public LoginUserDto user(@AuthenticationPrincipal LoginUserDto loginUser) { return loginUser; }
}
