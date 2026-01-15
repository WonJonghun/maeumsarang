package com.example.mshintra.common.service;

import com.example.mshintra.common.dto.AuthDto;
import com.example.mshintra.common.mapper.WindowMapper;
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

    private final WindowMapper windowMapper;
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
    public WindowCheckResult checkAndResolve(LoginUserDto loginUser, AuthDto auth,
                                             HttpSession session, String contextPath) {

        if (loginUser == null || loginUser.getIcCode() == null || loginUser.getIcCode().trim().isEmpty())
            return WindowCheckResult.fail("로그인이 필요합니다.");

        String rawCode = (auth == null || auth.getWinCode() == null) ? "" : auth.getWinCode().trim();
        if (rawCode.isEmpty() || "undefined".equalsIgnoreCase(rawCode) || "null".equalsIgnoreCase(rawCode))
            return WindowCheckResult.fail("요청 파라미터가 없습니다.");

        if (rawCode.indexOf('\r') >= 0 || rawCode.indexOf('\n') >= 0 || rawCode.indexOf(';') >= 0)
            return WindowCheckResult.fail("잘못된 요청입니다.");

        String rawName = (auth == null || auth.getWinName() == null) ? "" : auth.getWinName().trim();
        if (rawName.indexOf('\r') >= 0 || rawName.indexOf('\n') >= 0)
            return WindowCheckResult.fail("잘못된 요청입니다.");

        // winName 뒤 값 baseKey
        String doorKey = "";
        if (!rawName.isEmpty()) {
            String[] parts = rawName.split(";", -1);
            if (parts.length >= 3) doorKey = parts[parts.length - 1].trim();
        }

        // 메뉴 트리로 URL/baseKey/메뉴명 찾기
        List<MenuDto> tree = menuService.selectMenuTree(loginUser.getIcCode(), DEFAULT_MENU_KEYWORD, session);

        boolean hasAuth = false;
        String url = "";
        String baseKeyFromMenu = "";
        String hcName = "";

        Deque<MenuDto> stack = new ArrayDeque<>();
        if (tree != null) for (MenuDto m : tree) if (m != null) stack.push(m);

        while (!stack.isEmpty()) {
            MenuDto m = stack.pop();

            //권한 매칭
            String wc = (m.getCcWinCode() == null ? "" : m.getCcWinCode().trim());
            if (!wc.isEmpty() && wc.equalsIgnoreCase(rawCode)) {
                hasAuth = true;
                url = (m.getCcMenu2() == null ? "" : m.getCcMenu2().trim());
                baseKeyFromMenu = (m.getCcBaseKey() == null ? "" : m.getCcBaseKey().trim());
                hcName = (m.getCcMenuName() == null ? "" : m.getCcMenuName().trim());
                break;
            }

            List<MenuDto> ch = m.getChildren();
            if (ch != null) for (MenuDto c : ch) if (c != null) stack.push(c);
        }

        if (!hasAuth) return WindowCheckResult.fail("권한이 없습니다.");
        if (url.isEmpty() || "undefined".equalsIgnoreCase(url) || "null".equalsIgnoreCase(url))
            return WindowCheckResult.fail("페이지 URL 설정이 없습니다.");

        // baseKey
        String baseKey = doorKey;

        // auth 세팅
        auth.setWinCode(rawCode);
        auth.setWinName(rawName);
        auth.setBaseKey(baseKey);
        auth.setUserId(loginUser.getIcCode());

        String adminKeyRaw = windowMapper.selectAdminKey(auth);
        adminKeyRaw = (adminKeyRaw == null || adminKeyRaw.trim().isEmpty()) ? "NNNNNNN" : adminKeyRaw.trim();

        String perm = adminKeyRaw;
        String menuName = "";

        int comma = adminKeyRaw.indexOf(',');
        if (comma >= 0) {
            perm = adminKeyRaw.substring(0, comma).trim();
            menuName = adminKeyRaw.substring(comma + 1).trim();
        }
        if (menuName.isEmpty()) menuName = hcName;

        auth.setAdminKey(perm);
        auth.setMenuName(menuName);

        if (session != null) session.setAttribute("CM_AUTH", auth);

        if (!baseKey.isEmpty()) {
            String lowerUrl = url.toLowerCase();
            if (!(lowerUrl.contains("?basekey=") || lowerUrl.contains("&basekey="))) {
                String enc = URLEncoder.encode(baseKey, StandardCharsets.UTF_8);
                url = url + (url.contains("?") ? "&" : "?") + "baseKey=" + enc;
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
