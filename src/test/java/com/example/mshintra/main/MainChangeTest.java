package com.example.mshintra.main;

import com.example.mshintra.login.dto.LoginUserDto;
import com.example.mshintra.main.controller.MainChangeController;
import com.example.mshintra.main.controller.MainController;
import com.example.mshintra.main.dto.MainChangeDto;
import com.example.mshintra.main.mapper.MainMapper;
import com.example.mshintra.main.service.MainChangeService;
import com.example.mshintra.main.service.MainService;
import com.example.mshintra.security.PcMainActivityFilter;
import org.apache.ibatis.builder.xml.XMLMapperBuilder;
import org.apache.ibatis.session.Configuration;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.dao.TransientDataAccessResourceException;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class MainChangeTest {
    private MainService mainService;
    private MainChangeService changes;
    private MockMvc mvc;
    private final LocalDateTime first = LocalDateTime.of(2026, 10, 16, 10, 59, 5, 713000000);

    @BeforeEach
    void setUp() {
        mainService = mock(MainService.class);
        changes = new MainChangeService(mainService);
        mvc = MockMvcBuilders.standaloneSetup(new MainChangeController(changes))
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver()).build();
    }

    @AfterEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void personalChangesReachOnlyMatchingEmployeeAndKeepLeadingZeros() throws Exception {
        MvcResult own = connect("0419", first + "|" + first, "");
        MvcResult secondTab = connect("0419", first + "|" + first, "");
        MvcResult other = connect("251101", first + "|" + first, "");
        when(mainService.selectMainChanges(anyList())).thenReturn(List.of(
                row("ALL", first), row("0419", first.plusSeconds(1)), row("251101", first)));

        changes.checkChanges();

        assertEquals(1, events(own, "changed"));
        assertEquals(1, events(secondTab, "changed"));
        assertEquals(0, events(other, "changed"));
        verify(mainService).selectMainChanges(argThat(codes -> codes.size() == 3
                && codes.containsAll(List.of("ALL", "0419", "251101"))));
        changes.checkChanges();
        assertEquals(1, events(own, "changed"));
        assertTrue(other.getResponse().getContentAsString().contains(":keepalive"));
    }

    @Test
    void globalAndPersonalChangesProduceOneRefreshPerConnection() throws Exception {
        MvcResult own = connect("0419", first + "|" + first, "");
        MvcResult other = connect("251101", first + "|", "");
        when(mainService.selectMainChanges(anyList())).thenReturn(List.of(
                row("ALL", first.plusSeconds(1)), row("0419", first.plusSeconds(2))));
        changes.checkChanges();
        assertEquals(1, events(own, "changed"));
        assertEquals(1, events(other, "changed"));
        assertFalse(other.getResponse().getContentAsString().contains(first.plusSeconds(2).toString()));
    }

    @Test
    void reconnectUsesLastEventIdAndChangesAfterPageBaselineAreDetected() throws Exception {
        MvcResult resumed = connect("0419", "old-page-version", first + "|" + first);
        MvcResult initial = connect("251101", first + "|", "");
        when(mainService.selectMainChanges(anyList())).thenReturn(List.of(
                row("ALL", first), row("0419", first), row("251101", first.plusSeconds(1))));
        changes.checkChanges();
        assertEquals(0, events(resumed, "changed"));
        assertEquals(1, events(initial, "changed"));
    }

    @Test
    void timestampMovingBackwardAndNewEmployeeRowStillTriggerRefresh() throws Exception {
        MvcResult own = connect("0419", first + "|" + first, "");
        MvcResult newEmployee = connect("251101", first + "|", "");
        when(mainService.selectMainChanges(anyList())).thenReturn(List.of(
                row("ALL", first), row("0419", first.minusSeconds(1)), row("251101", first)));
        changes.checkChanges();
        assertEquals(1, events(own, "changed"));
        assertEquals(1, events(newEmployee, "changed"));
    }

    @Test
    void idleOrLoggedOutSessionsStopBeforeQueryingDatabase() throws Exception {
        MvcResult idle = connect("0419", first + "|", "");
        MvcResult logout = connect("251101", first + "|", "");
        MockHttpSession idleSession = (MockHttpSession) idle.getRequest().getSession(false);
        idleSession.setAttribute(PcMainActivityFilter.ACTIVITY_KEY, System.currentTimeMillis() - 3600001);
        logout.getRequest().getSession(false).invalidate();
        changes.checkChanges();
        assertEquals(1, events(idle, "session-expired"));
        assertEquals(1, events(logout, "session-expired"));
        verifyNoInteractions(mainService);
        changes.checkChanges();
        verifyNoInteractions(mainService);
    }

    @Test
    void databaseFailureKeepsVersionForRetry() throws Exception {
        MvcResult own = connect("0419", first + "|", "");
        when(mainService.selectMainChanges(anyList()))
                .thenThrow(new TransientDataAccessResourceException("temporary test failure"))
                .thenReturn(List.of(row("ALL", first.plusSeconds(1))));
        changes.checkChanges();
        assertEquals(0, events(own, "changed"));
        changes.checkChanges();
        assertEquals(1, events(own, "changed"));
    }

    @Test
    void mainPageCapturesVersionBeforeInitialDataRequests() throws Exception {
        MainChangeService service = mock(MainChangeService.class);
        when(service.selectVersion("0419")).thenReturn(first + "|");
        authenticate("0419");
        var pages = MockMvcBuilders.standaloneSetup(new MainController(null, null, null, mainService, service))
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver()).build();
        pages.perform(get("/pc/main.do").param("pcFrame", "true").param("userId", "251101"))
                .andExpect(view().name("pc/jsp/main/main"))
                .andExpect(model().attribute("changeVersion", first + "|"));
        verify(service).selectVersion("0419");
        clearInvocations(service);
        pages.perform(get("/pc/main.do")).andExpect(view().name("pc/jsp/common/workspace"));
        verifyNoInteractions(service);
    }

    @Test
    void initialVersionQueriesOnlyGlobalAndExactEmployee() {
        when(mainService.selectMainChanges(List.of("ALL", "0419")))
                .thenReturn(List.of(row("ALL", first), row("0419", first.plusSeconds(1))));
        assertEquals(first + "|" + first.plusSeconds(1), changes.selectVersion("0419"));
    }

    @Test
    void mapperReadsOnlySignalDatesWithBoundEmployeeCodes() throws Exception {
        String resource = "mybatis/mapper/MainMapper.xml";
        Configuration config = new Configuration();
        try (var stream = getClass().getClassLoader().getResourceAsStream(resource)) {
            assertNotNull(stream);
            new XMLMapperBuilder(stream, config, resource, config.getSqlFragments()).parse();
        }
        var sql = config.getMappedStatement(MainMapper.class.getName() + ".selectMainChanges")
                .getBoundSql(Map.of("codes", List.of("ALL", "0419")));
        assertTrue(sql.getSql().contains("FROM dbo.I_NewChanged"));
        assertFalse(sql.getSql().contains("0419"));
        assertEquals(2, sql.getParameterMappings().size());
        assertTrue(sql.getSql().strip().startsWith("SELECT"));
    }

    private MvcResult connect(String id, String version, String lastId) throws Exception {
        authenticate(id);
        MockHttpSession session = new MockHttpSession();
        session.setMaxInactiveInterval(3600);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                SecurityContextHolder.getContext());
        return mvc.perform(get("/pc/main/changes.do").session(session)
                        .param("version", version).param("userId", "spoofed-employee")
                        .header("Last-Event-ID", lastId))
                .andExpect(status().isOk()).andExpect(request().asyncStarted())
                .andExpect(header().string("Cache-Control", "no-store")).andReturn();
    }

    private void authenticate(String id) {
        var context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(new UsernamePasswordAuthenticationToken(
                LoginUserDto.builder().icCode(id).build(), null, List.of()));
        SecurityContextHolder.setContext(context);
    }

    private MainChangeDto row(String id, LocalDateTime date) {
        MainChangeDto row = new MainChangeDto();
        row.setSaCd(id);
        row.setUpDt(date);
        return row;
    }

    private int events(MvcResult result, String name) throws Exception {
        return result.getResponse().getContentAsString().split("event:" + name, -1).length - 1;
    }
}
