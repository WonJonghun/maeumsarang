package com.example.mshintra.config;

import com.example.mshintra.common.interceptor.MenuAuthInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.time.Duration;

@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final MenuAuthInterceptor menuAuthInterceptor;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/fonts/pretendard/pc/**")
                .addResourceLocations("classpath:/static/fonts/pretendard/pc/")
                .setCacheControl(CacheControl.maxAge(Duration.ofDays(365)).cachePublic().immutable());
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(menuAuthInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns(
                        "/",
                        "/login/**",
                        "/logout.do",
                        "/common/css/**",
                        "/pc/css/**",
                        "/mobile/css/**",
                        "/common/js/**",
                        "/pc/js/**",
                        "/mobile/js/**",
                        "/images/**",
                        "/favicon.ico",
                        "/manifest.json",
                        "/service-worker.js",
                        "/error",
                        "/error/**"
                );
    }
}
