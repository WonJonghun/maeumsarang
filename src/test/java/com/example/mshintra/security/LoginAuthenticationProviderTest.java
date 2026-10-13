package com.example.mshintra.security;

import com.example.mshintra.login.dto.LoginRequestDto;
import com.example.mshintra.login.dto.LoginUserDto;
import com.example.mshintra.login.mapper.LoginMapper;
import com.example.mshintra.login.service.LoginService;
import org.apache.ibatis.builder.xml.XMLMapperBuilder;
import org.apache.ibatis.session.Configuration;
import org.apache.ibatis.reflection.ParamNameResolver;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class LoginAuthenticationProviderTest {

    static Stream<Arguments> loginTypes() {
        return Stream.of(
                Arguments.of("pc", ""),
                Arguments.of("mobile", "Mob"),
                Arguments.of(null, "Mob"),
                Arguments.of("other", "Mob")
        );
    }

    @ParameterizedTest
    @MethodSource("loginTypes")
    void passwordCheckUsesLoginType(String loginType, String expectedFlag) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        if (loginType != null) request.setParameter("loginType", loginType);

        LoginMapper mapper = mock(LoginMapper.class);
        when(mapper.selectLoginUser(any(LoginRequestDto.class), eq("test-decrypt-key"))).thenReturn(new LoginUserDto());
        LoginService service = new LoginService(mapper);
        ReflectionTestUtils.setField(service, "securityDecryptKey", "test-decrypt-key");
        var token = new UsernamePasswordAuthenticationToken("test-user", "test-password");
        token.setDetails(new LoginAuthenticationDetails(request));
        new LoginAuthenticationProvider(service).authenticate(token);

        ArgumentCaptor<LoginRequestDto> captor = ArgumentCaptor.forClass(LoginRequestDto.class);
        verify(mapper).selectLoginUser(captor.capture(), eq("test-decrypt-key"));
        assertEquals("test-user", captor.getValue().getLoginId());
        assertEquals("test-password", captor.getValue().getLoginPw());
        assertEquals(loginType, captor.getValue().getLoginType());

        Configuration config = mapperConfiguration();
        var method = LoginMapper.class.getMethod("selectLoginUser", LoginRequestDto.class, String.class);
        var params = new ParamNameResolver(config, method)
                .getNamedParams(new Object[]{captor.getValue(), "test-decrypt-key"});
        var sql = config.getMappedStatement(LoginMapper.class.getName() + ".selectLoginUser")
                .getBoundSql(params);
        assertEquals(expectedFlag, sql.getAdditionalParameter("pwFlag"));
        assertEquals("test-user", config.newMetaObject(params).getValue("param.loginId"));
        assertEquals(2, sql.getParameterMappings().stream()
                .filter(param -> param.getProperty().equals("securityDecryptKey")).count());
        assertEquals("test-decrypt-key", config.newMetaObject(params).getValue("securityDecryptKey"));
    }

    @Test
    void rememberMeLoadsContactWithConfiguredKey() throws Exception {
        LoginMapper mapper = mock(LoginMapper.class);
        LoginUserDto user = LoginUserDto.builder()
                .icCode("test-user")
                .icHpPhone("010-1234-5678")
                .icPEmail("test@example.com")
                .build();
        when(mapper.selectLoginUserById("test-user", "test-decrypt-key")).thenReturn(user);
        LoginService service = new LoginService(mapper);
        ReflectionTestUtils.setField(service, "securityDecryptKey", "test-decrypt-key");

        assertSame(user, new LoginUserDetailsService(service).loadUserByUsername("test-user"));
        verify(mapper).selectLoginUserById("test-user", "test-decrypt-key");

        Configuration config = mapperConfiguration();
        var method = LoginMapper.class.getMethod("selectLoginUserById", String.class, String.class);
        var params = new ParamNameResolver(config, method)
                .getNamedParams(new Object[]{"test-user", "test-decrypt-key"});
        var sql = config.getMappedStatement(LoginMapper.class.getName() + ".selectLoginUserById")
                .getBoundSql(params);
        assertEquals(2, sql.getParameterMappings().stream()
                .filter(param -> param.getProperty().equals("securityDecryptKey")).count());
        assertEquals("test-user", config.newMetaObject(params).getValue("loginId"));
        assertEquals("test-decrypt-key", config.newMetaObject(params).getValue("securityDecryptKey"));
    }

    private Configuration mapperConfiguration() throws Exception {
        String resource = "mybatis/mapper/LoginMapper.xml";
        Configuration config = new Configuration();
        try (var stream = getClass().getClassLoader().getResourceAsStream(resource)) {
            assertNotNull(stream);
            new XMLMapperBuilder(stream, config, resource, config.getSqlFragments()).parse();
        }
        return config;
    }
}
