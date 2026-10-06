package com.example.mshintra.security;

import com.example.mshintra.login.dto.LoginRequestDto;
import com.example.mshintra.login.dto.LoginUserDto;
import com.example.mshintra.login.mapper.LoginMapper;
import org.apache.ibatis.builder.xml.XMLMapperBuilder;
import org.apache.ibatis.session.Configuration;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
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
        when(mapper.selectLoginUser(any(LoginRequestDto.class))).thenReturn(new LoginUserDto());
        var token = new UsernamePasswordAuthenticationToken("test-user", "test-password");
        token.setDetails(new LoginAuthenticationDetails(request));
        new LoginAuthenticationProvider(mapper).authenticate(token);

        ArgumentCaptor<LoginRequestDto> captor = ArgumentCaptor.forClass(LoginRequestDto.class);
        verify(mapper).selectLoginUser(captor.capture());
        assertEquals("test-user", captor.getValue().getLoginId());
        assertEquals("test-password", captor.getValue().getLoginPw());
        assertEquals(loginType, captor.getValue().getLoginType());

        String resource = "mybatis/mapper/LoginMapper.xml";
        Configuration config = new Configuration();
        try (var stream = getClass().getClassLoader().getResourceAsStream(resource)) {
            assertNotNull(stream);
            new XMLMapperBuilder(stream, config, resource, config.getSqlFragments()).parse();
        }
        var sql = config.getMappedStatement(LoginMapper.class.getName() + ".selectLoginUser")
                .getBoundSql(captor.getValue());
        assertEquals(expectedFlag, sql.getAdditionalParameter("pwFlag"));
    }
}
