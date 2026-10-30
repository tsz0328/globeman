package com.example.lucifer.interceptor;


import com.example.lucifer.util.JwtUtil;
import com.example.lucifer.util.Role;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.Cache;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jspecify.annotations.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;


import java.util.Map;
import java.util.concurrent.TimeUnit;

@Component
public class WebInterceptor implements HandlerInterceptor {

    // 全局缓存，key为token字符串，value为解析出来的用户信息
    private static final Cache<String, Map<String, String>> TOKEN_CACHE = Caffeine.newBuilder()
            .expireAfterWrite(6, TimeUnit.HOURS)
            .maximumSize(30000)
            .build();

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler) throws Exception {
        if (request.getMethod().equals("OPTIONS")){
            return true;
        }
        String token = request.getHeader("token");
        // token为空直接拦截
        if (token == null || token.trim().isEmpty()) {
            response.setStatus(401);
            response.setContentType("application/json;charset=utf-8");
            response.getWriter().write("{\"code\":401,\"msg\":\"token不存在\"}");
            return false;
        }

        // 先校验 token，避免 Caffeine loader 返回 null 抛 NullPointerException
        boolean valid;
        try {
            valid = JwtUtil.validateToken(token);
        } catch (Exception e) {
            valid = false;
        }
        if (!valid) {
            TOKEN_CACHE.invalidate(token);
            response.setStatus(401);
            response.setContentType("application/json;charset=utf-8");
            response.getWriter().write("{\"code\":401,\"msg\":\"token已过期\"}");
            return false;
        }

        // 校验通过再走缓存（原子解析一次，命中复用；loader 永不返回 null）
        Map<String, String> map = TOKEN_CACHE.get(token, JwtUtil::extractUserRole);
        if (map == null) {
            response.setStatus(401);
            response.setContentType("application/json;charset=utf-8");
            response.getWriter().write("{\"code\":401,\"msg\":\"token已过期\"}");
            return false;
        }

        Role.setLoginUser(map.get("account"),
                map.get("company"),
                map.get("role"),
                map.get("department"));
        return true;
    }

    @Override
    public void afterCompletion(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler, Exception ex) throws Exception {
        Role.clear();
    }

    public static String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // 取第一个有效 IP
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
