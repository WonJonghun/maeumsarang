package com.example.mshintra.main;

import com.example.mshintra.login.dto.LoginUserDto;
import com.example.mshintra.main.controller.MainController;
import com.example.mshintra.main.mapper.MainMapper;
import com.example.mshintra.main.service.MainService;
import com.example.mshintra.notice.dto.NoticeDto;
import org.apache.ibatis.builder.xml.XMLMapperBuilder;
import org.apache.ibatis.mapping.ResultMapping;
import org.apache.ibatis.mapping.StatementType;
import org.apache.ibatis.session.Configuration;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class MainLibraryTest {

    @AfterEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void libraryUsesAuthenticatedEmployeeAndFormatsDate() throws Exception {
        MainMapper mapper = mock(MainMapper.class);
        NoticeDto item = new NoticeDto();
        item.setTnTitle("자료실 안내");
        item.setTvUk("3202609101100");
        item.setTnDate("2026-09-10 00:00:00.0");
        item.setViewCount("999");
        item.setCcView("N");
        when(mapper.selectMainLibraryList("251101")).thenReturn(List.of(item));
        NoticeDto count = new NoticeDto();
        count.setTvUk(item.getTvUk());
        count.setViewCount("7");
        when(mapper.selectMainLibraryViewCounts(List.of(item.getTvUk()))).thenReturn(List.of(count));

        LoginUserDto user = new LoginUserDto();
        user.setIcCode("251101");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, List.of()));

        var mvc = MockMvcBuilders.standaloneSetup(new MainController(null, null, null, new MainService(mapper), null))
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver()).build();
        mvc.perform(get("/pc/main/libraryList.do").param("userId", "other-employee"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].tnTitle").value("자료실 안내"))
                .andExpect(jsonPath("$[0].tnDateStr").value("2026.09.10"))
                .andExpect(jsonPath("$[0].viewCount").value("7"))
                .andExpect(jsonPath("$[0].ccView").value("N"));
        verify(mapper).selectMainLibraryList("251101");
        verify(mapper).selectMainLibraryViewCounts(List.of("3202609101100"));
    }

    @Test
    void libraryKeepsFirstTenRowsInProcedureOrder() {
        MainMapper mapper = mock(MainMapper.class);
        List<NoticeDto> rows = new ArrayList<>();
        for (int index = 0; index < 15; index++) {
            NoticeDto item = new NoticeDto();
            item.setTnTitle("자료 " + index);
            item.setTvUk("3202610061" + index);
            item.setTnDate(index == 0 ? "2010-01-01" : "2026-10-06");
            item.setTnTop(index == 0 ? "Y" : "N");
            rows.add(item);
        }
        when(mapper.selectMainLibraryList("251101")).thenReturn(rows);

        var list = new MainService(mapper).selectMainLibraryList("251101");
        assertEquals(10, list.size());
        assertEquals(List.of("자료 0", "자료 1", "자료 2", "자료 3", "자료 4",
                        "자료 5", "자료 6", "자료 7", "자료 8", "자료 9"),
                list.stream().map(NoticeDto::getTnTitle).toList());
        assertEquals("2010.01.01", list.getFirst().getTnDateStr());
        verify(mapper).selectMainLibraryViewCounts(rows.subList(0, 10).stream().map(NoticeDto::getTvUk).toList());
    }

    @Test
    void libraryMatchesCountsByKeyAndShowsZeroForUnreadPosts() {
        MainMapper mapper = mock(MainMapper.class);
        List<NoticeDto> rows = List.of("3202610061100", "4202610061100", "5202610061100").stream().map(key -> {
            NoticeDto item = new NoticeDto();
            item.setTvUk(key);
            item.setTnDate("2026-10-06");
            item.setViewCount("999");
            return item;
        }).toList();
        NoticeDto first = new NoticeDto();
        first.setTvUk(rows.getFirst().getTvUk());
        first.setViewCount("7");
        NoticeDto second = new NoticeDto();
        second.setTvUk(rows.get(1).getTvUk());
        second.setViewCount("12");
        when(mapper.selectMainLibraryList("251101")).thenReturn(rows);
        when(mapper.selectMainLibraryViewCounts(rows.stream().map(NoticeDto::getTvUk).toList()))
                .thenReturn(List.of(second, first));

        var list = new MainService(mapper).selectMainLibraryList("251101");
        assertEquals(List.of("7", "12", "0"), list.stream().map(NoticeDto::getViewCount).toList());
    }

    @Test
    void emptyLibrarySkipsCountQuery() {
        MainMapper mapper = mock(MainMapper.class);
        when(mapper.selectMainLibraryList("251101")).thenReturn(List.of());

        assertTrue(new MainService(mapper).selectMainLibraryList("251101").isEmpty());
        verify(mapper, never()).selectMainLibraryViewCounts(anyList());
    }

    @Test
    void libraryCallsProcedureWithCategoryRangeAndMapsColumns() throws Exception {
        String resource = "mybatis/mapper/MainMapper.xml";
        Configuration config = new Configuration();
        try (var stream = getClass().getClassLoader().getResourceAsStream(resource)) {
            assertNotNull(stream);
            new XMLMapperBuilder(stream, config, resource, config.getSqlFragments()).parse();
        }

        var statement = config.getMappedStatement(MainMapper.class.getName() + ".selectMainLibraryList");
        var sql = statement.getBoundSql(Map.of("userId", "251101"));
        assertEquals(StatementType.CALLABLE, statement.getStatementType());
        assertTrue(sql.getSql().contains("dbo.Intranet_Main_Gongji('3', '5', ?)"));
        assertEquals("userId", sql.getParameterMappings().getFirst().getProperty());

        var columns = statement.getResultMaps().getFirst().getResultMappings().stream()
                .collect(Collectors.toMap(ResultMapping::getProperty, ResultMapping::getColumn));
        assertFalse(columns.containsKey("viewCount"));
        assertEquals("cc_UK", columns.get("tvUk"));
        assertEquals("Tn_UserName", columns.get("icName"));
        var counts = config.getMappedStatement(MainMapper.class.getName() + ".selectMainLibraryViewCounts")
                .getBoundSql(Map.of("keys", List.of("3202610061100", "4202610061100")));
        assertTrue(counts.getSql().contains("LEFT JOIN I_TotalNoteView"));
        assertTrue(counts.getSql().contains("COUNT(history.Tv_UK) AS viewCount"));
        assertTrue(counts.getSql().contains("GROUP BY posts.tvUk"));
        assertEquals(2, counts.getParameterMappings().size());
        assertFalse(counts.getSql().contains("3202610061100"));
    }
}
