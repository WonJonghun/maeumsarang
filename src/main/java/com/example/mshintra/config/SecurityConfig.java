package com.example.mshintra.config;

import com.example.mshintra.security.LoginAuthenticationProvider;
import com.example.mshintra.security.LoginUserDetailsService;
import jakarta.servlet.DispatcherType;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.rememberme.JdbcTokenRepositoryImpl;
import org.springframework.security.web.authentication.rememberme.PersistentTokenRepository;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;

import javax.sql.DataSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final LoginAuthenticationProvider loginAuthenticationProvider;
    private final LoginUserDetailsService loginUserDetailsService;
    private final DataSource dataSource;

    @Value("${security.remember-me.key}")
    private String rememberMeKey;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean
    public PersistentTokenRepository persistentTokenRepository() {
        JdbcTokenRepositoryImpl repository = new JdbcTokenRepositoryImpl();
        repository.setDataSource(dataSource);
        return repository;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http.csrf(csrf -> csrf
                .ignoringRequestMatchers("/api/**")
        );

        http.sessionManagement(session -> session
                .sessionFixation(sessionFixation -> sessionFixation.migrateSession())
                .invalidSessionUrl("/login/login.do?expired=true")
        );

        http.authenticationProvider(loginAuthenticationProvider);

        http.authorizeHttpRequests(auth -> auth
                .dispatcherTypeMatchers(DispatcherType.FORWARD, DispatcherType.ERROR).permitAll()
                .requestMatchers(
                        "/login/login.do",
                        "/login/loginProc.do",
                        "/logout.do",
                        "/error",
                        "/error/**",
                        "/favicon.ico",
                        "/manifest.json",
                        "/service-worker.js",
                        "/css/**",
                        "/js/**",
                        "/images/**"
                ).permitAll()
                .anyRequest().authenticated()
        );

        //로그인
        http.formLogin(form -> form
                .loginPage("/login/login.do")
                .loginProcessingUrl("/login/loginProc.do")
                .usernameParameter("loginId")
                .passwordParameter("loginPw")
                .defaultSuccessUrl("/main.do", true)
                .failureUrl("/login/login.do?error=true")
                .permitAll()
        );

        //로그인 상태 유지
        http.rememberMe(remember -> remember
                .rememberMeParameter("rememberMe")
                .rememberMeCookieName("MHS_REMEMBER")
                .tokenRepository(persistentTokenRepository())
                .userDetailsService(loginUserDetailsService)
                .tokenValiditySeconds(60 * 60 * 24 * 365)
                .useSecureCookie(true)
                .key(rememberMeKey)
        );

        //예외 처리
        http.exceptionHandling(exception -> exception
                .accessDeniedPage("/error/403.do")
        );

        //로그아웃
        http.logout(logout -> logout
                .logoutUrl("/logout.do")
                .logoutSuccessUrl("/login/login.do")
                .invalidateHttpSession(true)
                .clearAuthentication(true)
                .deleteCookies("JSESSIONID", "MHS_REMEMBER")
        );

        http.headers(headers -> headers
                .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'"))
                .frameOptions(frame -> frame.sameOrigin())
                .contentTypeOptions(Customizer.withDefaults())
                .referrerPolicy(ref -> ref.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER))
                .httpStrictTransportSecurity(hsts -> hsts
                        .includeSubDomains(true)
                        .preload(true)
                        .maxAgeInSeconds(31536000)
                )
                .xssProtection(xss -> xss.disable())
        );

        http.requiresChannel(channel -> channel
                .anyRequest().requiresSecure()
        );

        return http.build();
    }
}