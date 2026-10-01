package com.example.mshintra.login.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@RequiredArgsConstructor
@Controller
@RequestMapping("/login")
public class LoginController {
    /** 로그인 처리에 대한 건 LoginAuthenticationProvider 와 SecurityConfig 확인 **/
    //PC 로그인 화면
    @GetMapping("/pc/login.do")
    public String pcLoginPage(Authentication authentication) {
        if (authentication != null
                && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken)) {
            return "common/jsp/login/redirect";
        }

        return "pc/jsp/login/login";
    }

    // 로그인 화면
    @GetMapping("/login.do")
    public String loginPage(Authentication authentication) {
        if (authentication != null
                && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken)) {
            return "common/jsp/login/redirect";
        }

        return "mobile/jsp/login/login";
    }
}
