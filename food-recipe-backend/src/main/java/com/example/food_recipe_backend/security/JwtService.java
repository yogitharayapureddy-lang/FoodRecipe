
package com.example.food_recipe_backend.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    // Automatically generates a secure JWT signing key
    private final SecretKey key = Jwts.SIG.HS256.key().build();

    // Generate JWT after successful login
    public String generateToken(Long userId) {

        Instant now = Instant.now();

        return Jwts.builder()
                .subject(userId.toString())
                .issuedAt(Date.from(now))
                .expiration(
                    Date.from(now.plusSeconds(3600))
                )
                .signWith(key)
                .compact();
    }

    // Validate JWT and get logged-in user ID
    public Long getUserId(String token) {

        String subject = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();

        return Long.valueOf(subject);
    }
}
