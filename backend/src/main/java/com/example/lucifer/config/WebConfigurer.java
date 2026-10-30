package com.example.lucifer.config;

import com.example.lucifer.interceptor.WebInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfigurer implements WebMvcConfigurer {

    private final WebInterceptor webInterceptor;

    public WebConfigurer(WebInterceptor webInterceptor) {
        this.webInterceptor = webInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(webInterceptor)
                .addPathPatterns("/**") // 拦截所有路径
                .excludePathPatterns( // 排除拦截的路径
                        "/index/*",
                        "/picture/*",
                        "/file/*",
                        "/login",
                        "/rsa"
                );
    }
}
