package com.example.mshintra.menu;

import com.example.mshintra.menu.dto.MenuDto;
import com.example.mshintra.menu.mapper.MenuMapper;
import com.example.mshintra.menu.service.MenuService;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpSession;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MenuServiceTest {
    private final MenuMapper mapper = mock(MenuMapper.class);
    private final MenuService service = new MenuService(mapper);

    @Test
    void quickSequenceValuesUseOriginalAncestorsAndNavigationKeys() {
        when(mapper.selectMenuList("251101", "Quick")).thenReturn(quickMenus());
        when(mapper.selectMenuList("251101", "")).thenReturn(allMenus());

        var favorites = service.selectMenuTree("251101", "Quick", null);

        assertEquals(List.of("사내업무", "편집"), names(favorites));
        var work = favorites.getFirst().getChildren();
        assertEquals(List.of("전자게시판", "전자결재", "회계업무"), names(work));
        assertEquals(List.of("직원공지사항", "자료실"), names(work.get(0).getChildren()));
        assertEquals(List.of("업무일지"), names(work.get(1).getChildren()));
        assertEquals(List.of("지출결의서 관리"), names(work.get(2).getChildren()));
        var notice = work.get(0).getChildren().get(0);
        var library = work.get(0).getChildren().get(1);
        assertEquals(2, notice.getCcLevel());
        assertEquals("w_gongji_list", notice.getCcWinCode());
        assertEquals("1", notice.getCcBaseKey());
        assertEquals("3", library.getCcBaseKey());
        assertEquals("WS", work.get(1).getChildren().getFirst().getCcBaseKey());
        assertEquals("2", work.get(2).getChildren().getFirst().getCcBaseKey());
        assertTrue(notice.getChildren().isEmpty());
        assertTrue(library.getChildren().isEmpty());
        var edit = favorites.get(1).getChildren();
        assertEquals(List.of("Help Code", "Menu 관리"), names(edit));
        assertEquals("2003010000", edit.get(0).getChildren().getFirst().getCcCode());
        assertEquals("2004010000", edit.get(1).getChildren().getFirst().getCcCode());
        verify(mapper).selectMenuList("251101", "Quick");
        verify(mapper).selectMenuList("251101", "");
    }

    @Test
    void freshFavoritesDoNotMutateCachedMenusOrOtherRequests() {
        var all = allMenus();
        var quick = quickMenus();
        when(mapper.selectMenuList("251101", "Quick")).thenReturn(quick);
        when(mapper.selectMenuList("251101", "")).thenReturn(all);
        var session = new MockHttpSession();

        var first = service.selectMenuTree("251101", "Quick", session);
        first.getFirst().getChildren().clear();
        var second = service.selectMenuTree("251101", "Quick", session);
        var full = service.selectMenuTree("251101", "", session);

        assertEquals(3, second.getFirst().getChildren().size());
        assertEquals(List.of("직원공지사항", "자유게시판", "자료실"),
                names(full.getFirst().getChildren().getFirst().getChildren()));
        assertTrue(all.stream().allMatch(menu -> menu.getChildren().isEmpty()));
        assertTrue(quick.stream().allMatch(menu -> menu.getChildren().isEmpty()));
        verify(mapper, times(2)).selectMenuList("251101", "Quick");
        verify(mapper, times(1)).selectMenuList("251101", "");
    }

    @Test
    void favoritesReflectAdditionsAndRemovalsWithinTheSameSession() {
        var quick = quickMenus();
        when(mapper.selectMenuList("251101", "Quick"))
                .thenReturn(List.of(quick.get(0)))
                .thenReturn(List.of(quick.get(0), quick.get(1)))
                .thenReturn(List.of(quick.get(1)))
                .thenReturn(List.of());
        when(mapper.selectMenuList("251101", "")).thenReturn(allMenus());
        var session = new MockHttpSession();

        var first = service.selectMenuTree("251101", "Quick", session);
        var added = service.selectMenuTree("251101", "Quick", session);
        var removed = service.selectMenuTree("251101", "Quick", session);
        var empty = service.selectMenuTree("251101", "Quick", session);

        assertEquals(List.of("직원공지사항"), names(first.getFirst().getChildren().getFirst().getChildren()));
        assertEquals(List.of("직원공지사항", "자료실"), names(added.getFirst().getChildren().getFirst().getChildren()));
        assertEquals(List.of("자료실"), names(removed.getFirst().getChildren().getFirst().getChildren()));
        assertTrue(empty.isEmpty());
        verify(mapper, times(4)).selectMenuList("251101", "Quick");
        verify(mapper, times(1)).selectMenuList("251101", "");
    }

    @Test
    void favoritesOutsideTheEmployeesMenuAreExcluded() {
        when(mapper.selectMenuList("251101", "Quick")).thenReturn(List.of(
                menu("0101010000", "변경된 이름", 51, "wrong-window", null),
                menu("9901010000", "권한 없는 메뉴", 52, "w_other", null)));
        when(mapper.selectMenuList("251101", "")).thenReturn(allMenus());

        var favorites = service.selectMenuTree("251101", " Quick ", null);

        assertEquals(List.of("사내업무"), names(favorites));
        var notice = favorites.getFirst().getChildren().getFirst().getChildren().getFirst();
        assertEquals("직원공지사항", notice.getCcMenuName());
        assertEquals("w_gongji_list", notice.getCcWinCode());
        assertEquals("1", notice.getCcBaseKey());
    }

    @Test
    void emptyFavoritesDoNotQueryTheFullMenu() {
        when(mapper.selectMenuList("251101", "Quick")).thenReturn(List.of());

        assertTrue(service.selectMenuTree("251101", "Quick", null).isEmpty());

        verify(mapper, never()).selectMenuList("251101", "");
    }

    @Test
    void normalAndMobileTreesKeepTheirExistingHierarchy() {
        when(mapper.selectMenuList("251101", "")).thenReturn(allMenus());
        when(mapper.selectMenuList("251101", "Mobile")).thenReturn(allMenus().subList(0, 5));

        var full = service.selectMenuTree("251101", "", null);
        var mobile = service.selectMenuTree("251101", "Mobile", null);

        assertEquals(List.of("사내업무", "편집"), names(full));
        assertEquals(List.of("사내업무"), names(mobile));
        assertEquals(List.of("직원공지사항", "자유게시판", "자료실"),
                names(mobile.getFirst().getChildren().getFirst().getChildren()));
        verify(mapper, never()).selectMenuList("251101", "Quick");
    }

    private List<MenuDto> allMenus() {
        return List.of(
                menu("0100000000", "사내업무", 0, "", ""),
                menu("0101000000", "전자게시판", 1, "", ""),
                menu("0101010000", "직원공지사항", 2, "w_gongji_list", "1"),
                menu("0101020000", "자유게시판", 2, "w_gongji_list", "2"),
                menu("0101030000", "자료실", 2, "w_gongji_list", "3"),
                menu("0130000000", "전자결재", 1, "", ""),
                menu("0130020000", "업무일지", 2, "w_elecsign", "WS"),
                menu("0143000000", "회계업무", 1, "", ""),
                menu("0143010000", "지출결의서 관리", 2, "w_jichul_list", "2"),
                menu("2000000000", "편집", 0, "", ""),
                menu("2003000000", "Help Code", 1, "", ""),
                menu("2003010000", "Help Code", 2, "w_HelpCode_list", ""),
                menu("2004000000", "Menu 관리", 1, "", ""),
                menu("2004010000", "Menu 관리", 2, "w_menulayout", ""));
    }

    private List<MenuDto> quickMenus() {
        return List.of(
                menu("0101010000", "직원공지사항", 51, "w_gongji_list", null),
                menu("0101030000", "자료실", 52, "w_gongji_list", null),
                menu("0130020000", "업무일지", 53, "w_elecsign", null),
                menu("0143010000", "지출결의서 관리", 54, "w_jichul_list", null),
                menu("2003010000", "Help Code", 55, "w_HelpCode_list", null),
                menu("2004010000", "Menu 관리", 56, "w_menulayout", null));
    }

    private MenuDto menu(String code, String name, int level, String window, String base) {
        return MenuDto.builder().ccCode(code).ccMenuName(name).ccLevel(level)
                .ccWinCode(window).ccBaseKey(base).build();
    }

    private List<String> names(List<MenuDto> menus) {
        return menus.stream().map(MenuDto::getCcMenuName).toList();
    }
}
