package com.smartmfg.monitor.controller;

import com.smartmfg.monitor.dto.AuthDto;
import com.smartmfg.monitor.entity.User;
import com.smartmfg.monitor.mapper.DtoMapper;
import com.smartmfg.monitor.security.UserPrincipal;
import com.smartmfg.monitor.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users Control", description = "Endpoints for managing operators, managers, engineers and reading active technician profiles.")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    @Operation(summary = "Get list of all registered employees/technicians")
    public ResponseEntity<List<AuthDto.UserResponse>> getAllUsers() {
        List<AuthDto.UserResponse> response = userService.getAllUsers().stream()
                .map(DtoMapper::toUserResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile")
    @Operation(summary = "Retrieve current authenticated user details")
    public ResponseEntity<AuthDto.UserResponse> getCurrentUserProfile(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        User user = userService.getUserById(userPrincipal.getId());
        return ResponseEntity.ok(DtoMapper.toUserResponse(user));
    }
}
