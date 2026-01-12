package com.example.mshintra.common.service;

import com.example.mshintra.login.dto.LoginUserDto;
import com.example.mshintra.menu.dto.MenuDto;
import com.example.mshintra.menu.service.MenuService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.List;

@RequiredArgsConstructor
@Service
public class WindowService {

    private final MenuService menuService;
    private static final String DEFAULT_MENU_KEYWORD = "Mobile";

    public record WindowCheckResult(boolean success, String url, String message) {
        public static WindowCheckResult ok(String url) {
            return new WindowCheckResult(true, url, null);
        }

        public static WindowCheckResult fail(String message) {
            return new WindowCheckResult(false, null, message);
        }
    }

    @Transactional(readOnly = true)
    public WindowCheckResult checkAndResolve(LoginUserDto loginUser, String winName, HttpSession session, String contextPath) {

        if (loginUser == null || loginUser.getIcCode() == null || loginUser.getIcCode().trim().isEmpty())
            return WindowCheckResult.fail("로그인이 필요합니다.");

        String raw = (winName == null ? "" : winName.trim());
        if (raw.isEmpty() || "undefined".equalsIgnoreCase(raw) || "null".equalsIgnoreCase(raw))
            return WindowCheckResult.fail("요청 파라미터가 없습니다.");

        if (raw.indexOf('\r') >= 0 || raw.indexOf('\n') >= 0)
            return WindowCheckResult.fail("잘못된 요청입니다.");

        //메뉴 트리 불러와서 권한 있는지 체크 후 basekey 획득해서 넘김
        List<MenuDto> tree = menuService.selectMenuTree(loginUser.getIcCode(), DEFAULT_MENU_KEYWORD, session);

        boolean hasAuth = false;
        String url = "";
        String baseKey = "";
        String hcName = "";

        Deque<MenuDto> stack = new ArrayDeque<>();
        if (tree != null) for (MenuDto m : tree) if (m != null) stack.push(m);

        while (!stack.isEmpty()) {
            MenuDto m = stack.pop();

            String wn = (m.getCcWinName() == null ? "" : m.getCcWinName().trim());
            if (!wn.isEmpty() && wn.equalsIgnoreCase(raw)) {
                hasAuth = true;
                url = (m.getCcMenu2() == null ? "" : m.getCcMenu2().trim());
                baseKey = (m.getCcBaseKey() == null ? "" : m.getCcBaseKey().trim());
                hcName = (m.getCcMenuName() == null ? "" : m.getCcMenuName().trim());
                break;
            }

            List<MenuDto> ch = m.getChildren();
            if (ch != null) for (MenuDto c : ch) if (c != null) stack.push(c);
        }

        if (!hasAuth) return WindowCheckResult.fail("권한이 없습니다.");
        if (url.isEmpty() || "undefined".equalsIgnoreCase(url) || "null".equalsIgnoreCase(url))
            return WindowCheckResult.fail("페이지 URL 설정이 없습니다.");

        if (!baseKey.isEmpty()) {
            String lowerUrl = url.toLowerCase();
            if (!(lowerUrl.contains("?basekey=") || lowerUrl.contains("&basekey="))) {
                String enc = URLEncoder.encode(baseKey, StandardCharsets.UTF_8);
                url = url + (url.contains("?") ? "&" : "?") + "baseKey=" + enc;
            }
        }

        if (!hcName.isEmpty()) {
            String lowerUrl = url.toLowerCase();
            if (!(lowerUrl.contains("?hcname=") || lowerUrl.contains("&hcname="))) {
                String enc = URLEncoder.encode(hcName, StandardCharsets.UTF_8);
                url = url + (url.contains("?") ? "&" : "?") + "hcName=" + enc;
            }
        }

        url = url.trim();

        // 외부 URL 차단
        if (url.matches("(?i)^https?://.*")) return WindowCheckResult.fail("잘못된 요청입니다.");

        if (!url.startsWith("/")) url = "/" + url;
        if (url.startsWith("//")) return WindowCheckResult.fail("잘못된 요청입니다.");
        if (url.contains("..") || url.contains("\\"))
            return WindowCheckResult.fail("잘못된 요청입니다.");

        String ctx = (contextPath == null ? "" : contextPath.trim());
        if (!ctx.isEmpty() && !"/".equals(ctx)) url = ctx + url;

        return WindowCheckResult.ok(url);
    }
}
