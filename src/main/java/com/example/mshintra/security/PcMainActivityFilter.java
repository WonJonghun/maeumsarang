package com.example.mshintra.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class PcMainActivityFilter extends OncePerRequestFilter {
    public static final String ACTIVITY_KEY = PcMainActivityFilter.class.getName() + ".lastActivity";

    //자동 갱신을 제외한 요청 시간 기록
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        String path = request.getRequestURI().substring(request.getContextPath().length());
        boolean automatic = path.equals("/pc/main/changes.do")
                || "true".equals(request.getHeader("X-PC-Main-Refresh"));
        if (session != null && session.getAttribute(ACTIVITY_KEY) != null) {
            if (isExpired(session)) {
                session.invalidate();
                SecurityContextHolder.clearContext();
                if (automatic) {
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
                    return;
                }
            } else if (!automatic && path.endsWith(".do")) {
                session.setAttribute(ACTIVITY_KEY, System.currentTimeMillis());
            }
        }
        chain.doFilter(request, response);
    }

    //메인 자동 갱신을 시작한 세션의 실제 요청 기준
    public static void start(HttpSession session) {
        if (session.getAttribute(ACTIVITY_KEY) == null) {
            session.setAttribute(ACTIVITY_KEY, session.getLastAccessedTime());
        }
    }

    //일반 요청 없이 설정된 시간이 지났는지 확인
    public static boolean isExpired(HttpSession session) {
        Long last = (Long) session.getAttribute(ACTIVITY_KEY);
        return last != null && session.getMaxInactiveInterval() > 0
                && System.currentTimeMillis() - last >= session.getMaxInactiveInterval() * 1000L;
    }
}
