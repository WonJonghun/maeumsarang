package com.example.mshintra.config;

import com.example.mshintra.common.interceptor.MenuAuthInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final MenuAuthInterceptor menuAuthInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(menuAuthInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns(
                        "/login/**",
                        "/logout.do",
                        "/css/**",
                        "/js/**",
                        "/images/**",
                        "/favicon.ico",
                        "/manifest.json",
                        "/service-worker.js",
                        "/error",
                        "/error/**"
                );
    }
}
