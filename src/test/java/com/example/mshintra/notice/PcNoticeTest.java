package com.example.mshintra.notice;

import com.example.mshintra.common.dto.MenuAuthDto;
import com.example.mshintra.common.service.MenuAuthService;
import com.example.mshintra.login.dto.LoginUserDto;
import com.example.mshintra.menu.dto.MenuDto;
import com.example.mshintra.menu.service.MenuService;
import com.example.mshintra.notice.controller.PcNoticeController;
import com.example.mshintra.notice.dto.NoticeDto;
import com.example.mshintra.notice.dto.NoticeMenuDto;
import com.example.mshintra.notice.dto.PcNoticeMenuDto;
import com.example.mshintra.notice.dto.PcNoticeSearchDto;
import com.example.mshintra.notice.mapper.NoticeMapper;
import com.example.mshintra.notice.service.PcNoticeService;
import com.example.mshintra.notice.service.NoticeService;
import org.apache.ibatis.builder.xml.XMLMapperBuilder;
import org.apache.ibatis.session.Configuration;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class PcNoticeTest {
    private final NoticeMapper mapper = mock(NoticeMapper.class);
    private final MenuService menus = mock(MenuService.class);
    private final MenuAuthService auth = mock(MenuAuthService.class);
    private final NoticeService notices = mock(NoticeService.class);
    private final PcNoticeService service = new PcNoticeService(mapper, menus, auth, notices);
    private final MockHttpSession session = new MockHttpSession();

    @AfterEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void listBindsAuthenticatedEmployeeAndReturnsPageCount() throws Exception {
        allowBoard("1");
        when(mapper.selectPcNoticeCount(any())).thenReturn(43);
        NoticeDto post = new NoticeDto();
        post.setTnTitle("공지사항");
        when(mapper.selectPcNoticeList(any())).thenReturn(List.of(post));
        LoginUserDto user = new LoginUserDto();
        user.setIcCode("251101");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, List.of()));
        var mvc = MockMvcBuilders.standaloneSetup(new PcNoticeController(service))
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver()).build();
        mvc.perform(get("/pc/notice/list.do").session(session)
                        .param("tnFlag", "1").param("offset", "20").param("limit", "20")
                        .param("searchId", "other-employee")
                        .param("searchFromDate", "2026-01-01").param("searchToDate", "2026-10-13"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(43))
                .andExpect(jsonPath("$.list[0].tnTitle").value("공지사항"));
        var search = ArgumentCaptor.forClass(PcNoticeSearchDto.class);
        verify(mapper).selectPcNoticeList(search.capture());
        assertEquals("251101", search.getValue().getSearchId());
        assertEquals("titleContent", search.getValue().getSearchType());
        assertEquals(20, search.getValue().getOffset());
    }

    @Test
    void boardUsesWorkspaceOrEmbeddedViewWithoutBypassingBoardPermission() throws Exception {
        allowBoard("1");
        LoginUserDto user = new LoginUserDto();
        user.setIcCode("251101");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, List.of()));
        var mvc = MockMvcBuilders.standaloneSetup(new PcNoticeController(service))
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver()).build();
        mvc.perform(get("/pc/notice/board.do").session(session))
                .andExpect(status().isOk())
                .andExpect(view().name("pc/jsp/common/workspace"))
                .andExpect(model().attribute("startTab", "board"))
                .andExpect(model().attribute("baseKey", 1));
        mvc.perform(get("/pc/notice/board.do").session(session).param("pcFrame", "true"))
                .andExpect(status().isOk())
                .andExpect(view().name("pc/jsp/notice/noticeList"));
        when(auth.checkAndSetSession(any(), eq(session))).thenReturn(false);
        for (String frame : List.of("false", "true")) {
            mvc.perform(get("/pc/notice/board.do").session(session).param("pcFrame", frame))
                    .andExpect(status().isForbidden());
        }
    }

    @Test
    void libraryCategoriesUseDatabaseCodesAndParentBoardPermission() throws Exception {
        allowBoard("3");
        when(notices.getNoticeMenuList()).thenReturn(List.of(
                NoticeMenuDto.builder().hcSeq(3).hcCode1("5").hcName("지식자료실")
                        .subMenuList(List.of(NoticeMenuDto.builder().hcSeq(2).hcName("QI").build())).build(),
                NoticeMenuDto.builder().hcSeq(4).hcCode1("4").hcName("서식자료실")
                        .subMenuList(List.of(NoticeMenuDto.builder().hcSeq(12).hcName("감염관리").build())).build(),
                NoticeMenuDto.builder().hcSeq(5).hcCode1("3").hcName("일반자료실")
                        .subMenuList(List.of(NoticeMenuDto.builder().hcSeq(20).hcName("기타").build())).build(),
                NoticeMenuDto.builder().hcSeq(6).hcCode1("6").hcName("팀자료").build()));
        var board = service.selectBoardMenus("251101", session).getFirst();
        assertTrue(board.isLibraryAll());
        assertEquals(List.of("지식자료실", "서식자료실", "일반자료실"),
                board.getChildren().stream().map(PcNoticeMenuDto::getCcMenuName).toList());
        assertEquals(List.of("5", "4", "3"),
                board.getChildren().stream().map(PcNoticeMenuDto::getCcBaseKey).toList());
        var qi = board.getChildren().getFirst().getChildren().getFirst();
        assertEquals("QI", qi.getCcMenuName());
        assertEquals("5", qi.getCcBaseKey());
        assertEquals("2", qi.getTnSeflag());
        assertEquals("12", board.getChildren().get(1).getChildren().getFirst().getTnSeflag());
        assertEquals("3", service.checkBoard(4, "251101", session).getCcBaseKey());
        verify(notices).getNoticeMenuList();
        var permission = ArgumentCaptor.forClass(MenuAuthDto.class);
        verify(auth).checkAndSetSession(permission.capture(), eq(session));
        assertEquals("3", permission.getValue().getBaseKey());
        LoginUserDto user = new LoginUserDto();
        user.setIcCode("251101");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, List.of()));
        var mvc = MockMvcBuilders.standaloneSetup(new PcNoticeController(service))
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver()).build();
        mvc.perform(get("/pc/notice/menuList.do").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].libraryAll").value(true))
                .andExpect(jsonPath("$[0].children[0].ccBaseKey").value("5"))
                .andExpect(jsonPath("$[0].children[0].tnSeflag").value(""))
                .andExpect(jsonPath("$[0].children[0].children[0].tnSeflag").value("2"));
    }

    @Test
    void libraryAllStillRequiresLibraryPermissionAndRejectsConflictingFilters() {
        allowBoard("1");
        var search = search();
        search.setTnFlag(3);
        search.setLibraryAll(true);
        assertEquals(403, assertThrows(ResponseStatusException.class,
                () -> service.selectBoardPage(search, "251101", session)).getStatusCode().value());
        allowBoard("3");
        search.setTnSeflag("2");
        assertEquals(400, assertThrows(ResponseStatusException.class,
                () -> service.selectBoardPage(search, "251101", session)).getStatusCode().value());
        allowBoard("1");
        search.setTnFlag(1);
        search.setTnSeflag("");
        assertEquals(400, assertThrows(ResponseStatusException.class,
                () -> service.selectBoardPage(search, "251101", session)).getStatusCode().value());
        verifyNoInteractions(mapper);
    }

    @Test
    void libraryAllAndSubcategoryApplyToBothRowsAndCount() throws Exception {
        String resource = "mybatis/mapper/NoticeMapper.xml";
        Configuration config = new Configuration();
        try (var stream = getClass().getClassLoader().getResourceAsStream(resource)) {
            assertNotNull(stream);
            new XMLMapperBuilder(stream, config, resource, config.getSqlFragments()).parse();
        }
        var search = search();
        search.setTnFlag(3);
        search.setLibraryAll(true);
        for (String statement : List.of("selectPcNoticeList", "selectPcNoticeCount")) {
            var query = config.getMappedStatement(NoticeMapper.class.getName() + "." + statement);
            String allSql = query.getBoundSql(search).getSql();
            assertTrue(allSql.contains("note.Tn_Flag BETWEEN 3 AND 5"));
            assertFalse(allSql.contains("note.Tn_Flag = ?"));
            search.setLibraryAll(false);
            search.setTnFlag(5);
            search.setTnSeflag("2");
            var filtered = query.getBoundSql(search);
            assertTrue(filtered.getSql().contains("note.Tn_Flag = ?"));
            assertTrue(filtered.getSql().contains("note.Tn_Seflag = ?"));
            assertFalse(filtered.getSql().contains("BETWEEN 3 AND 5"));
            assertTrue(filtered.getParameterMappings().stream().anyMatch(item -> "tnSeflag".equals(item.getProperty())));
            search.setLibraryAll(true);
            search.setTnFlag(3);
            search.setTnSeflag("");
        }
    }

    @Test
    void unauthorizedBoardDoesNotReadOrRecordPosts() {
        allowBoard("1");
        var search = search();
        search.setTnFlag(4);
        assertEquals(403, assertThrows(ResponseStatusException.class,
                () -> service.selectBoardPage(search, "251101", session)).getStatusCode().value());
        when(auth.checkAndSetSession(any(), eq(session))).thenReturn(false);
        search.setTnFlag(1);
        assertEquals(403, assertThrows(ResponseStatusException.class,
                () -> service.selectBoardDetail(search, "251101", session)).getStatusCode().value());
        verifyNoInteractions(mapper);
    }

    @Test
    void invalidPeriodAndPageSizeAreRejectedBeforeQuery() {
        allowBoard("1");
        var search = search();
        search.setSearchFromDate("2026-10-14");
        assertEquals(400, assertThrows(ResponseStatusException.class,
                () -> service.selectBoardPage(search, "251101", session)).getStatusCode().value());
        search.setSearchFromDate("2026-01-01");
        search.setLimit(101);
        assertEquals(400, assertThrows(ResponseStatusException.class,
                () -> service.selectBoardPage(search, "251101", session)).getStatusCode().value());
        search.setLimit(20);
        search.setSearchType("unknown");
        assertEquals(400, assertThrows(ResponseStatusException.class,
                () -> service.selectBoardPage(search, "251101", session)).getStatusCode().value());
        verifyNoInteractions(mapper);
    }

    @Test
    void detailRecordsOnlyExistingPostForAuthenticatedEmployee() {
        allowBoard("1");
        var search = search();
        search.setTvUk("1202610130001");
        assertEquals(404, assertThrows(ResponseStatusException.class,
                () -> service.selectBoardDetail(search, "251101", session)).getStatusCode().value());
        verify(mapper, never()).totalNoteView(any(), any());
        NoticeDto post = new NoticeDto();
        post.setTvUk(search.getTvUk());
        when(mapper.selectPcNoticeDetail(search)).thenReturn(post);
        assertSame(post, service.selectBoardDetail(search, "251101", session));
        verify(mapper).totalNoteView("1202610130001", "251101");
        assertEquals("251101", search.getSearchId());
    }

    @Test
    void listAndCountShareBoundSearchFiltersAndIncludeWholeEndDate() throws Exception {
        String resource = "mybatis/mapper/NoticeMapper.xml";
        Configuration config = new Configuration();
        try (var stream = getClass().getClassLoader().getResourceAsStream(resource)) {
            assertNotNull(stream);
            new XMLMapperBuilder(stream, config, resource, config.getSqlFragments()).parse();
        }
        var search = search();
        search.setSearchKeyword("' OR 1=1 --");
        String namespace = NoticeMapper.class.getName();
        String title = "UPPER(note.Tn_Title) LIKE '%' + UPPER(?) + '%'";
        String content = "UPPER(CONVERT(nvarchar(max), note.Tn_Remark)) LIKE '%' + UPPER(?) + '%'";
        for (String type : List.of("titleContent", "title", "content", "writer")) {
            search.setSearchType(type);
            var list = config.getMappedStatement(namespace + ".selectPcNoticeList").getBoundSql(search);
            var count = config.getMappedStatement(namespace + ".selectPcNoticeCount").getBoundSql(search);
            for (var sql : List.of(list, count)) {
                String text = sql.getSql().replaceAll("\\s+", " ");
                assertEquals(type.equals("titleContent") || type.equals("title"), text.contains(title));
                assertEquals(type.equals("titleContent") || type.equals("content"), text.contains(content));
                assertEquals(type.equals("writer"), text.contains("UPPER(insa.Ic_Name) LIKE '%' + UPPER(?) + '%'"));
                if (type.equals("titleContent")) {
                    assertTrue(text.contains("AND (" + title + " OR " + content + ")"));
                }
                assertEquals(type.equals("titleContent") || type.equals("writer") ? 2L : 1L,
                        sql.getParameterMappings().stream().filter(item -> "searchKeyword".equals(item.getProperty())).count());
                assertTrue(text.contains("note.Tn_Flag = ?"));
                assertTrue(text.contains("DATEADD(DAY, 1, CONVERT(date, ?))"));
                assertTrue(text.contains("note.Tn_DelFlag NOT IN (0)"));
                assertFalse(text.contains(search.getSearchKeyword()));
            }
            assertTrue(list.getSql().contains("note.Tn_Time DESC, note.Tn_Seq DESC, note.Tn_Aflag DESC"));
            assertFalse(list.getSql().contains("Tn_Passward"));
        }
        var detail = config.getMappedStatement(namespace + ".selectPcNoticeDetail").getBoundSql(search);
        assertTrue(detail.getSql().contains("WHERE note.Tn_Flag = ?"));
        assertTrue(detail.getParameterMappings().stream().anyMatch(item -> "tvUk".equals(item.getProperty())));
    }

    @Test
    void unreadStatusUsesMainBoardHireDateAndAuthenticatedViewHistory() throws Exception {
        String resource = "mybatis/mapper/NoticeMapper.xml";
        Configuration config = new Configuration();
        try (var stream = getClass().getClassLoader().getResourceAsStream(resource)) {
            assertNotNull(stream);
            new XMLMapperBuilder(stream, config, resource, config.getSqlFragments()).parse();
        }
        var search = search();
        search.setSearchId("251101");
        search.setTvUk("1202610130001");
        String namespace = NoticeMapper.class.getName();
        for (String statement : List.of("selectPcNoticeList", "selectPcNoticeDetail")) {
            var sql = config.getMappedStatement(namespace + "." + statement).getBoundSql(search);
            String text = sql.getSql().replaceAll("\\s+", " ");
            assertTrue(text.contains("WHEN insa.Ic_Indate < '2013-03-01' THEN '2013-03-01' ELSE insa.Ic_Indate"));
            assertTrue(text.contains("WHERE Tv_SaCd = ? AND Tv_UK = CONCAT(note.Tn_Flag"));
            assertTrue(text.contains("THEN 'Y' ELSE 'N' END AS ccView"));
            assertFalse(text.contains("FROM P_InsaCode WHERE Ic_Code = ?"));
            assertEquals("searchId", sql.getParameterMappings().getFirst().getProperty());
        }
    }

    private void allowBoard(String flag) {
        when(menus.selectMenuTree(eq("251101"), isNull(), eq(session))).thenReturn(List.of(
                MenuDto.builder().ccWinCode("w_gongji_list").ccBaseKey(flag).ccMenuName("게시판").build()));
        when(auth.checkAndSetSession(any(), eq(session))).thenReturn(true);
    }

    private PcNoticeSearchDto search() {
        var search = new PcNoticeSearchDto();
        search.setTnFlag(1);
        search.setOffset(0);
        search.setLimit(20);
        search.setSearchFromDate("2026-01-01");
        search.setSearchToDate("2026-10-13");
        return search;
    }
}
