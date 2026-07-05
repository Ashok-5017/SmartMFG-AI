package com.smartmfg.monitor.controller;

import com.smartmfg.monitor.dto.AuthDto;
import com.smartmfg.monitor.entity.Role;
import com.smartmfg.monitor.entity.User;
import com.smartmfg.monitor.exception.BadRequestException;
import com.smartmfg.monitor.repository.RoleRepository;
import com.smartmfg.monitor.repository.UserRepository;
import com.smartmfg.monitor.security.JwtTokenProvider;
import com.smartmfg.monitor.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for user login, registration, password reset and token refreshing.")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and return JWT tokens")
    public ResponseEntity<AuthDto.JwtResponse> authenticateUser(@Valid @RequestBody AuthDto.LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.usernameOrEmail(),
                        loginRequest.password()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Set<String> roles = userPrincipal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        return ResponseEntity.ok(new AuthDto.JwtResponse(
                jwt,
                refreshToken,
                userPrincipal.getId(),
                userPrincipal.getUsername(),
                userPrincipal.getEmail(),
                roles
        ));
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user inside the manufacturing portal")
    public ResponseEntity<AuthDto.MessageResponse> registerUser(@Valid @RequestBody AuthDto.RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.username())) {
            throw new BadRequestException("Username is already taken!");
        }

        if (userRepository.existsByEmail(registerRequest.email())) {
            throw new BadRequestException("Email Address already in use!");
        }

        // Create user
        User user = User.builder()
                .username(registerRequest.username())
                .email(registerRequest.email())
                .password(passwordEncoder.encode(registerRequest.password()))
                .enabled(true) // Set default enabled
                .verified(false) // Verification required
                .verificationToken(UUID.randomUUID().toString())
                .build();

        Set<String> strRoles = registerRequest.roles();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null || strRoles.isEmpty()) {
            Role userRole = roleRepository.findByName("ROLE_OPERATOR")
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                String roleName = role;
                if (!roleName.startsWith("ROLE_")) {
                    roleName = "ROLE_" + roleName.toUpperCase();
                }
                Role targetRole = roleRepository.findByName(roleName)
                        .orElseThrow(() -> new RuntimeException("Error: Role '" + role + "' is not found."));
                roles.add(targetRole);
            });
        }

        user.setRoles(roles);
        userRepository.save(user);

        return ResponseEntity.ok(new AuthDto.MessageResponse("User registered successfully! Verification token: " + user.getVerificationToken()));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Get a new Access Token using a valid Refresh Token")
    public ResponseEntity<AuthDto.TokenRefreshResponse> refreshAccessToken(@Valid @RequestBody AuthDto.RefreshTokenRequest request) {
        String refreshToken = request.refreshToken();
        if (tokenProvider.validateToken(refreshToken)) {
            Long userId = tokenProvider.getUserIdFromJWT(refreshToken);
            
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new BadRequestException("Invalid token user reference"));

            if (!user.isEnabled()) {
                throw new BadRequestException("User account is disabled");
            }

            // Expiry settings
            String newAccessToken = tokenProvider.generateTokenFromUserId(userId, 86400000); // 24 hours
            String newRefreshToken = tokenProvider.generateTokenFromUserId(userId, 604800000); // 7 days

            return ResponseEntity.ok(new AuthDto.TokenRefreshResponse(newAccessToken, newRefreshToken));
        } else {
            throw new BadRequestException("Refresh token is invalid or expired!");
        }
    }

    @GetMapping("/verify")
    @Operation(summary = "Verify user email address using verification token")
    public ResponseEntity<AuthDto.MessageResponse> verifyUser(@RequestParam("token") String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid verification token!"));

        user.setVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);

        return ResponseEntity.ok(new AuthDto.MessageResponse("User verified successfully!"));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Generate password reset link/token")
    public ResponseEntity<AuthDto.MessageResponse> forgotPassword(@RequestParam("email") String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Email address not found!"));

        user.setResetToken(UUID.randomUUID().toString());
        userRepository.save(user);

        return ResponseEntity.ok(new AuthDto.MessageResponse("Reset token generated: " + user.getResetToken()));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password using token")
    public ResponseEntity<AuthDto.MessageResponse> resetPassword(
            @RequestParam("token") String token,
            @RequestParam("password") String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid password reset token!"));

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        userRepository.save(user);

        return ResponseEntity.ok(new AuthDto.MessageResponse("Password reset successfully!"));
    }
}
