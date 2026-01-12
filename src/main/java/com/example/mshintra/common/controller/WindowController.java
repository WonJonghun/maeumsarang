package com.example.mshintra.common.controller;

import com.example.mshintra.common.service.WindowService;
import com.example.mshintra.login.dto.LoginUserDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/window")
public class WindowController {

    private final WindowService windowService;

    @PostMapping("/window.do")
    public WindowService.WindowCheckResult window(@AuthenticationPrincipal LoginUserDto loginUser, @RequestParam(value = "winName", required = false) String winName, HttpSession session, HttpServletRequest request) {
        String ctx = (request == null ? "" : request.getContextPath());
        return windowService.checkAndResolve(loginUser, winName, session, ctx);
    }
}
