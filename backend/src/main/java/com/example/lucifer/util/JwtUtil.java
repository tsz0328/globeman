package com.example.lucifer.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {
    //密钥
    private static final String SECRET_KEY = "qqr13637332568.";
    //有效时间
    private static final long EXPIRATION_TIME = 1000 * 60 * 60 * 12;

    //生成Token
    public static String generateToken(Map<String, Object> claims) {
        return Jwts.builder()
                .setClaims(claims)          // 存放自定义数据
                .setIssuedAt(new Date())    // 签发时间
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME)) // 过期时间
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY) // 签名算法 + 密钥
                .compact();
    }

    //解析 Token 获取里面的信息
    public static Claims extractClaims(String token) {
        return Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .parseClaimsJws(token)
                .getBody();
    }

    //从token中获取用户名/用户ID
    public static Map<String,String> extractUserRole(String token) {
        Map<String,String> map = new HashMap<>();
        map.put("account",extractClaims(token).get("account", String.class));
        map.put("company",extractClaims(token).get("company", String.class));
        map.put("role",extractClaims(token).get("role", String.class));
        map.put("department",extractClaims(token).get("department", String.class));
        return map;
    }

        //验证Token是否有效
    public static boolean validateToken(String token) {
        try {
            extractClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
