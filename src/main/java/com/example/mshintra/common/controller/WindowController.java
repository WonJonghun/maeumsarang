package com.example.mshintra.common.controller;

import com.example.mshintra.common.dto.AuthDto;
import com.example.mshintra.common.service.WindowService;
import com.example.mshintra.login.dto.LoginUserDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/window")
public class WindowController {

    private final WindowService windowService;

    @PostMapping("/window.do")
    public WindowService.WindowCheckResult window(@AuthenticationPrincipal LoginUserDto loginUser, AuthDto auth,
                                                  HttpSession session, HttpServletRequest request) {
        String ctx = (request == null ? "" : request.getContextPath());

        if (auth == null) auth = AuthDto.builder().build();
        auth.setUserId(loginUser == null ? null : loginUser.getIcCode());

        return windowService.checkAndResolve(loginUser, auth, session, ctx);
    }
}
