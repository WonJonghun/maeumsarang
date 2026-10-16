package com.example.mshintra.menu.service;

import com.example.mshintra.menu.dto.MenuDto;
import com.example.mshintra.menu.mapper.MenuMapper;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@RequiredArgsConstructor
@Service
public class MenuService {

    private final MenuMapper menuMapper;
    private static final String SESSION_MENU_CACHE = "CM_MENU_CACHE";

    private static class CacheItem {
        private final String icCode;
        private final String keyword;
        private final List<MenuDto> list;

        private CacheItem(String icCode, String keyword, List<MenuDto> list) {
            this.icCode = icCode;
            this.keyword = keyword;
            this.list = list;
        }
    }

    @Transactional(readOnly = true)
    @SuppressWarnings("unchecked")
    public List<MenuDto> selectMenuTree(String icCode, String keyword, HttpSession session) {

        if (icCode == null || icCode.isBlank()) return Collections.emptyList();
        String kw = (keyword == null ? "" : keyword.trim());
        if (kw.isEmpty() || "undefined".equalsIgnoreCase(kw) || "null".equalsIgnoreCase(kw)) kw = "";
        boolean quick = "Quick".equalsIgnoreCase(kw);
        List<MenuDto> list = null;

        //즐겨찾기는 매번 DB 조회
        if (session == null || quick) {
            list = menuMapper.selectMenuList(icCode, kw);
        } else {
            Object o = session.getAttribute(SESSION_MENU_CACHE);
            Map<String, CacheItem> cache = (o instanceof Map) ? (Map<String, CacheItem>) o : new HashMap<>();
            CacheItem item = cache.get(kw);
            if (item != null && icCode.equals(item.icCode) && item.list != null) list = item.list;
            else {
                list = menuMapper.selectMenuList(icCode, kw);
                if (list == null) list = Collections.emptyList();
                cache.put(kw, new CacheItem(icCode, kw, list));
                session.setAttribute(SESSION_MENU_CACHE, cache);
            }
        }

        if (list == null || list.isEmpty()) return Collections.emptyList();

        if (quick) {
            Set<String> codes = new HashSet<>();
            for (MenuDto menu : list) codes.add(menu.getCcCode());
            return selectFavoriteMenus(selectMenuTree(icCode, "", session), codes);
        }

        List<MenuDto> copy = new ArrayList<>(list.size());
        for (MenuDto m : list) {
            copy.add(new MenuDto(
                    m.getCcCode(),
                    m.getCcMenuName(),
                    m.getCcLevel(),
                    m.getCcWinName(),
                    m.getCcWinCode(),
                    m.getCcMenu2(),
                    m.getCcBaseKey(),
                    new ArrayList<>()
            ));
        }

        int minLevel = copy.stream().mapToInt(MenuDto::getCcLevel).min().orElse(0);
        List<MenuDto> roots = new ArrayList<>();
        Deque<MenuDto> stack = new ArrayDeque<>();

        for (MenuDto m : copy) {
            int level = Math.max(0, m.getCcLevel() - minLevel);
            while (stack.size() > level) stack.removeLast();
            if (level == 0) {
                roots.add(m);
                stack.clear();
                stack.addLast(m);
                continue;
            }
            if (!stack.isEmpty()) stack.peekLast().getChildren().add(m);
            else roots.add(m);
            stack.addLast(m);
        }

        return roots;
    }

    //기존 메뉴 분류에서 즐겨찾기와 상위 메뉴 추출
    private List<MenuDto> selectFavoriteMenus(List<MenuDto> menus, Set<String> codes) {
        List<MenuDto> favorites = new ArrayList<>();
        for (MenuDto menu : menus) {
            List<MenuDto> children = selectFavoriteMenus(menu.getChildren(), codes);
            if (!codes.contains(menu.getCcCode()) && children.isEmpty()) continue;
            favorites.add(new MenuDto(
                    menu.getCcCode(),
                    menu.getCcMenuName(),
                    menu.getCcLevel(),
                    menu.getCcWinName(),
                    menu.getCcWinCode(),
                    menu.getCcMenu2(),
                    menu.getCcBaseKey(),
                    children
            ));
        }
        return favorites;
    }
}
