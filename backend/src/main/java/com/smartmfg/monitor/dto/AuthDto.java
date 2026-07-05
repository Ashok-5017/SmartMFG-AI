package com.smartmfg.monitor.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.Set;

public class AuthDto {

    public record LoginRequest(
        @NotBlank(message = "Username or email is required")
        String usernameOrEmail,

        @NotBlank(message = "Password is required")
        String password
    ) {}

    public record RegisterRequest(
        @NotBlank(message = "Username is required")
        @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
        String username,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        @Size(max = 100)
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 6, max = 100, message = "Password must be at least 6 characters")
        String password,

        Set<String> roles
    ) {}

    public record JwtResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        Long id,
        String username,
        String email,
        Set<String> roles
    ) {
        public JwtResponse(String accessToken, String refreshToken, Long id, String username, String email, Set<String> roles) {
            this(accessToken, refreshToken, "Bearer", id, username, email, roles);
        }
    }

    public record RefreshTokenRequest(
        @NotBlank(message = "Refresh token is required")
        String refreshToken
    ) {}

    public record TokenRefreshResponse(
        String accessToken,
        String refreshToken,
        String tokenType
    ) {
        public TokenRefreshResponse(String accessToken, String refreshToken) {
            this(accessToken, refreshToken, "Bearer");
        }
    }

    public record UserResponse(
        Long id,
        String username,
        String email,
        boolean enabled,
        boolean verified,
        Set<String> roles,
        LocalDateTime createdAt
    ) {}

    public record MessageResponse(String message) {}
}
