package com.example.mshintra.security;

import com.example.mshintra.config.SecurityConfig;
import com.example.mshintra.login.controller.LoginController;
import com.example.mshintra.login.dto.LoginUserDto;
import com.example.mshintra.login.service.LoginService;
import com.example.mshintra.main.controller.MainChangeController;
import com.example.mshintra.main.service.MainChangeService;
import com.example.mshintra.main.service.MainService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.MapPropertySource;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.mock.web.MockServletContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.FilterChainProxy;
import org.springframework.security.web.authentication.rememberme.CookieTheftException;
import org.springframework.security.web.authentication.rememberme.InMemoryTokenRepositoryImpl;
import org.springframework.security.web.authentication.rememberme.PersistentTokenRepository;
import org.springframework.security.web.authentication.rememberme.PersistentRememberMeToken;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import javax.sql.DataSource;
import java.util.Map;
import java.util.Date;
import java.util.Base64;
import java.nio.charset.StandardCharsets;
import java.net.URLDecoder;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class LoginSessionTest {
    private AnnotationConfigWebApplicationContext context;
    private MockMvc mvc;
    private MockHttpSession loggedInSession;

    @BeforeEach
    void setUp() {
        context = new AnnotationConfigWebApplicationContext();
        context.setServletContext(new MockServletContext());
        context.getEnvironment().getPropertySources().addFirst(
                new MapPropertySource("test", Map.of("security.remember-me.key", "test-remember-key")));
        context.register(SecurityConfig.class, TestBeans.class, TestPage.class, LoginController.class,
                MainChangeController.class);
        context.refresh();
        mvc = MockMvcBuilders.webAppContextSetup(context)
                .addFilters(context.getBean(FilterChainProxy.class)).build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
        context.close();
    }

    @Test
    void expiredSessionRestoresAuthenticationWithRememberMe() throws Exception {
        Cookie cookie = login(true);
        var result = mvc.perform(get("/pc/test.do").secure(true).cookie(cookie).with(expiredSession()))
                .andExpect(status().isOk()).andExpect(content().string("251101")).andReturn();
        assertNotNull(result.getRequest().getSession(false));
        assertNotNull(result.getRequest().getSession(false).getAttribute("SPRING_SECURITY_CONTEXT"));
        assertNotNull(result.getResponse().getCookie("MHS_REMEMBER"));
    }

    @Test
    void requestWithoutRememberMeStillRequiresLoginAfterTimeout() throws Exception {
        login(false);
        mvc.perform(get("/pc/test.do").secure(true).with(expiredSession()))
                .andExpect(status().isFound())
                .andExpect(redirectedUrl("/login/pc/login.do?expired=true"));
    }

    @Test
    void replayAfterCompletedRestoreStillInvalidatesRememberMe() throws Exception {
        Cookie cookie = login(true);
        mvc.perform(get("/pc/test.do").secure(true).cookie(cookie).with(expiredSession()))
                .andExpect(status().isOk());
        assertThrows(CookieTheftException.class,
                () -> mvc.perform(get("/pc/test.do").secure(true).cookie(cookie).with(expiredSession())));
        mvc.perform(get("/pc/test.do").secure(true).cookie(cookie).with(expiredSession()))
                .andExpect(status().isFound())
                .andExpect(redirectedUrl("/login/pc/login.do?expired=true"));
    }

    @ParameterizedTest
    @ValueSource(booleans = {true, false})
    void overlappingRequestsRestoreOnlySameValidatedCookie(boolean validCookie) throws Exception {
        Cookie cookie = login(true);
        String[] tokens = new String(Base64.getDecoder().decode(cookie.getValue()), StandardCharsets.UTF_8).split(":");
        String invalidValue = Base64.getEncoder().withoutPadding()
                .encodeToString((tokens[0] + ":invalid-token").getBytes(StandardCharsets.UTF_8));
        Cookie secondInput = validCookie ? cookie : new Cookie("MHS_REMEMBER", invalidValue);
        CountDownLatch firstLoading = new CountDownLatch(1);
        CountDownLatch finishLoading = new CountDownLatch(1);
        AtomicInteger loads = new AtomicInteger();
        AtomicReference<Thread> secondThread = new AtomicReference<>();
        when(context.getBean(LoginService.class).selectLoginUserById(anyString())).thenAnswer(invocation -> {
            if (loads.incrementAndGet() == 1) {
                firstLoading.countDown();
                assertTrue(finishLoading.await(5, TimeUnit.SECONDS));
            }
            return LoginUserDto.builder().icCode("251101").icName("테스트 직원").build();
        });
        try (var executor = Executors.newFixedThreadPool(2)) {
            var first = executor.submit(() -> mvc.perform(get("/pc/test.do").secure(true).cookie(cookie).with(expiredSession()))
                    .andExpect(status().isOk()).andExpect(content().string("251101")).andReturn());
            assertTrue(firstLoading.await(5, TimeUnit.SECONDS));
            var second = executor.submit(() -> {
                secondThread.set(Thread.currentThread());
                return mvc.perform(get("/pc/test.do").secure(true).cookie(secondInput).with(expiredSession()))
                        .andExpect(status().isOk()).andExpect(content().string("251101")).andReturn();
            });
            boolean waiting = false;
            for (int attempt = 0; attempt < 200 && !waiting; attempt++) {
                Thread thread = secondThread.get();
                waiting = thread != null && thread.getState() == Thread.State.BLOCKED;
                if (!waiting) Thread.sleep(5);
            }
            finishLoading.countDown();
            assertTrue(waiting, "두 번째 요청이 첫 번째 자동로그인 복구와 겹쳐야 합니다.");
            Cookie firstCookie = first.get(5, TimeUnit.SECONDS).getResponse().getCookie("MHS_REMEMBER");
            if (validCookie) {
                Cookie secondCookie = second.get(5, TimeUnit.SECONDS).getResponse().getCookie("MHS_REMEMBER");
                assertEquals(firstCookie.getValue(), secondCookie.getValue());
                mvc.perform(get("/pc/test.do").secure(true).cookie(secondCookie).with(expiredSession()))
                        .andExpect(status().isOk()).andExpect(content().string("251101"));
            } else {
                var failure = assertThrows(ExecutionException.class, () -> second.get(5, TimeUnit.SECONDS));
                assertInstanceOf(CookieTheftException.class, failure.getCause());
            }
        } finally {
            finishLoading.countDown();
        }
    }

    @Test
    void expiredPersistentTokenStillRequiresLogin() throws Exception {
        Cookie cookie = login(true);
        String series = URLDecoder.decode(new String(Base64.getDecoder().decode(cookie.getValue()), StandardCharsets.UTF_8)
                .split(":")[0], StandardCharsets.UTF_8);
        PersistentTokenRepository repository = context.getBean(PersistentTokenRepository.class);
        PersistentRememberMeToken token = repository.getTokenForSeries(series);
        repository.removeUserTokens(token.getUsername());
        repository.createNewToken(new PersistentRememberMeToken(token.getUsername(), series, token.getTokenValue(),
                new Date(System.currentTimeMillis() - TimeUnit.DAYS.toMillis(366))));
        mvc.perform(get("/pc/test.do").secure(true).cookie(cookie).with(expiredSession()))
                .andExpect(status().isFound()).andExpect(redirectedUrl("/login/pc/login.do?expired=true"));
    }

    @Test
    void parallelRequestBeforeFirstResponseReturnsStillRestores() throws Exception {
        Cookie cookie = login(true);
        TestPage page = context.getBean(TestPage.class);
        page.started = new CountDownLatch(1);
        page.finish = new CountDownLatch(1);
        try (var executor = Executors.newFixedThreadPool(2)) {
            try {
                var first = executor.submit(() -> mvc.perform(get("/pc/test.do").secure(true).cookie(cookie).with(expiredSession()))
                        .andExpect(status().isOk()).andReturn());
                assertTrue(page.started.await(5, TimeUnit.SECONDS));
                var second = executor.submit(() -> mvc.perform(get("/pc/test.do").secure(true).cookie(cookie).with(expiredSession()))
                        .andExpect(status().isOk()).andExpect(content().string("251101")).andReturn());
                Cookie secondCookie = second.get(5, TimeUnit.SECONDS).getResponse().getCookie("MHS_REMEMBER");
                page.finish.countDown();
                Cookie firstCookie = first.get(5, TimeUnit.SECONDS).getResponse().getCookie("MHS_REMEMBER");
                assertEquals(firstCookie.getValue(), secondCookie.getValue());
            } finally {
                page.finish.countDown();
            }
        }
    }

    @Test
    void logoutRevokesPersistentLogin() throws Exception {
        Cookie cookie = login(true);
        var restored = mvc.perform(get("/pc/test.do").secure(true).cookie(cookie).with(expiredSession())).andReturn();
        MockHttpSession session = (MockHttpSession) restored.getRequest().getSession(false);
        var csrfRequest = mvc.perform(get("/login/pc/login.do").secure(true).session(session)).andReturn();
        CsrfToken csrf = (CsrfToken) csrfRequest.getRequest().getAttribute(CsrfToken.class.getName());
        mvc.perform(post("/logout.do").secure(true).session(session).param("loginType", "pc")
                        .param(csrf.getParameterName(), csrf.getToken()))
                .andExpect(status().isFound()).andExpect(redirectedUrl("/login/pc/login.do"));
        mvc.perform(get("/pc/test.do").secure(true).cookie(cookie).with(expiredSession()))
                .andExpect(status().isFound()).andExpect(redirectedUrl("/login/pc/login.do?expired=true"));
    }

    @Test
    void automaticRefreshDoesNotExtendTrackedIdleTime() throws Exception {
        login(false);
        long last = System.currentTimeMillis() - 60000;
        loggedInSession.setAttribute(PcMainActivityFilter.ACTIVITY_KEY, last);
        mvc.perform(get("/pc/test.do").secure(true).session(loggedInSession)
                        .header("X-PC-Main-Refresh", "true"))
                .andExpect(status().isOk());
        assertEquals(last, loggedInSession.getAttribute(PcMainActivityFilter.ACTIVITY_KEY));
        mvc.perform(get("/pc/test.do").secure(true).session(loggedInSession))
                .andExpect(status().isOk());
        assertTrue((Long) loggedInSession.getAttribute(PcMainActivityFilter.ACTIVITY_KEY) > last);
    }

    @Test
    void automaticRefreshRejectsExpiredTrackedSession() throws Exception {
        login(false);
        loggedInSession.setAttribute(PcMainActivityFilter.ACTIVITY_KEY, System.currentTimeMillis() - 3600001);
        mvc.perform(get("/pc/test.do").secure(true).session(loggedInSession)
                        .header("X-PC-Main-Refresh", "true"))
                .andExpect(status().isUnauthorized());
        assertTrue(loggedInSession.isInvalid());
    }

    @Test
    void normalRequestRestoresRememberMeAfterTrackedIdleTimeout() throws Exception {
        Cookie cookie = login(true);
        loggedInSession.setAttribute(PcMainActivityFilter.ACTIVITY_KEY, System.currentTimeMillis() - 3600001);
        mvc.perform(get("/pc/test.do").secure(true).session(loggedInSession).cookie(cookie))
                .andExpect(status().isOk()).andExpect(content().string("251101"));
        assertTrue(loggedInSession.isInvalid());
    }

    @Test
    void normalRequestRequiresLoginAfterTrackedIdleTimeoutWithoutRememberMe() throws Exception {
        login(false);
        loggedInSession.setAttribute(PcMainActivityFilter.ACTIVITY_KEY, System.currentTimeMillis() - 3600001);
        mvc.perform(get("/pc/test.do").secure(true).session(loggedInSession).with(request -> {
                    request.setScheme("https");
                    return request;
                }))
                .andExpect(status().isFound())
                .andExpect(redirectedUrl("https://localhost/login/pc/login.do"));
    }

    @ParameterizedTest
    @ValueSource(booleans = {true, false})
    void sseCompletesAfterLogoutOrIdleWithoutSecurityDispatchErrors(boolean logout) throws Exception {
        login(false);
        var stream = mvc.perform(get("/pc/main/changes.do").secure(true).session(loggedInSession)
                        .param("version", "|"))
                .andExpect(status().isOk()).andExpect(request().asyncStarted()).andReturn();
        long last = (Long) loggedInSession.getAttribute(PcMainActivityFilter.ACTIVITY_KEY);
        mvc.perform(get("/pc/main/changes.do").secure(true).session(loggedInSession).param("version", "|"))
                .andExpect(request().asyncStarted());
        assertEquals(last, loggedInSession.getAttribute(PcMainActivityFilter.ACTIVITY_KEY));
        if (logout) loggedInSession.invalidate();
        else loggedInSession.setAttribute(PcMainActivityFilter.ACTIVITY_KEY, System.currentTimeMillis() - 3600001);
        context.getBean(MainChangeService.class).checkChanges();
        assertTrue(stream.getResponse().getContentAsString().contains("event:session-expired"));
        mvc.perform(asyncDispatch(stream)).andExpect(status().isOk());
    }

    private Cookie login(boolean remember) throws Exception {
        var first = mvc.perform(get("/login/pc/login.do").secure(true)).andReturn();
        CsrfToken csrf = (CsrfToken) first.getRequest().getAttribute(CsrfToken.class.getName());
        String csrfValue = csrf.getToken();
        var result = mvc.perform(post("/login/loginProc.do").secure(true)
                        .session((MockHttpSession) first.getRequest().getSession(false))
                        .param(csrf.getParameterName(), csrfValue)
                        .param("loginId", "251101").param("loginPw", "test-password")
                        .param("loginType", "pc").param("rememberMe", String.valueOf(remember)))
                .andExpect(status().isFound()).andExpect(redirectedUrl("/pc/main.do")).andReturn();
        loggedInSession = (MockHttpSession) result.getRequest().getSession(false);
        loggedInSession.setMaxInactiveInterval(3600);
        Cookie cookie = result.getResponse().getCookie("MHS_REMEMBER");
        assertEquals(remember, cookie != null && cookie.getMaxAge() > 0);
        if (remember) {
            assertEquals(60 * 60 * 24 * 365, cookie.getMaxAge());
            assertTrue(cookie.getSecure());
            assertTrue(cookie.isHttpOnly());
        }
        return cookie;
    }

    private RequestPostProcessor expiredSession() {
        return request -> {
            request.setRequestedSessionId("expired-session");
            request.setRequestedSessionIdValid(false);
            return request;
        };
    }

    @Configuration
    @EnableWebMvc
    static class TestBeans {
        @Bean
        MainChangeService mainChangeService() {
            return new MainChangeService(mock(MainService.class));
        }

        @Bean
        LoginService loginService() {
            LoginService service = mock(LoginService.class);
            LoginUserDto user = LoginUserDto.builder().icCode("251101").icName("테스트 직원").build();
            when(service.login(any())).thenReturn(user);
            when(service.selectLoginUserById(anyString())).thenReturn(user);
            return service;
        }

        @Bean
        LoginAuthenticationProvider loginAuthenticationProvider(LoginService service) {
            return new LoginAuthenticationProvider(service);
        }

        @Bean
        LoginUserDetailsService loginUserDetailsService(LoginService service) {
            return new LoginUserDetailsService(service);
        }

        @Bean
        DataSource dataSource() {
            return mock(DataSource.class);
        }

        @Bean
        static BeanPostProcessor tokenRepositoryForTest() {
            return new BeanPostProcessor() {
                @Override
                public Object postProcessAfterInitialization(Object bean, String name) {
                    return bean instanceof PersistentTokenRepository ? new InMemoryTokenRepositoryImpl() : bean;
                }
            };
        }
    }

    @RestController
    static class TestPage {
        private final AtomicInteger requests = new AtomicInteger();
        private CountDownLatch started;
        private CountDownLatch finish;

        @GetMapping("/pc/test.do")
        String testPage() throws InterruptedException {
            if (started != null && requests.incrementAndGet() == 1) {
                started.countDown();
                assertTrue(finish.await(5, TimeUnit.SECONDS));
            }
            return SecurityContextHolder.getContext().getAuthentication().getName();
        }
    }
}
