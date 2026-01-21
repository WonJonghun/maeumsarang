package com.example.mshintra.common.interceptor;

import com.example.mshintra.common.dto.MenuAuthDto;
import com.example.mshintra.common.service.MenuAuthService;
import com.example.mshintra.common.util.CmUtil;
import com.example.mshintra.login.dto.LoginUserDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.PrintWriter;

@Component
@RequiredArgsConstructor
public class MenuAuthInterceptor implements HandlerInterceptor {

    private final MenuAuthService menuAuthService;

    //메뉴이동요청할 때 어드민키 불러와서 체크
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        String ccWinCode = CmUtil.trim(request.getParameter("ccWinCode"));
        String ccBaseKey = CmUtil.trim(request.getParameter("ccBaseKey"));
        String menuName = CmUtil.trim(request.getParameter("ccMenuName"));

        if (CmUtil.isBlank(ccWinCode)) return true; // 메뉴 이동 요청만 체크
        if (CmUtil.isBlank(menuName)) menuName = CmUtil.trim(request.getParameter("menuName"));

        LoginUserDto loginUser = getLoginUser();
        String userId = (loginUser == null) ? "" : CmUtil.trim(loginUser.getIcCode());

        MenuAuthDto dto = new MenuAuthDto();
        dto.setWinCode(ccWinCode);
        dto.setBaseKey(ccBaseKey);
        dto.setUserId(userId);

        HttpSession session = request.getSession();

        boolean ok = menuAuthService.checkAndSetSession(dto, menuName, session);
        if (!ok) {
            response.setStatus(403);
            response.setContentType("text/html; charset=UTF-8");

            PrintWriter w = response.getWriter();
            w.print("<script>");
            w.print("if (typeof customAlert === 'function') {");
            w.print("  customAlert('권한', '권한이 없습니다.', 'WARN');");
            w.print("  setTimeout(function(){ history.back(); }, 200);");
            w.print("} else {");
            w.print("  alert('권한이 없습니다.'); history.back();");
            w.print("}");
            w.print("</script>");
            w.flush();

            return false;
        }

        return true;
    }

    private LoginUserDto getLoginUser() {
        Authentication a = SecurityContextHolder.getContext().getAuthentication();
        if (a == null) return null;
        Object p = a.getPrincipal();
        return (p instanceof LoginUserDto) ? (LoginUserDto) p : null;
    }
}
