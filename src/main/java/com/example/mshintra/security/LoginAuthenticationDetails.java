package com.example.mshintra.security;

import jakarta.servlet.http.HttpServletRequest;
import lombok.Getter;
import org.springframework.security.web.authentication.WebAuthenticationDetails;

@Getter
public class LoginAuthenticationDetails extends WebAuthenticationDetails {

    private static final long serialVersionUID = 1L;

    private final String loginType;

    public LoginAuthenticationDetails(HttpServletRequest request) {
        super(request);
        this.loginType = request.getParameter("loginType");
    }
}
