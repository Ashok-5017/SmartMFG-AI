package com.smartmfg.monitor.controller;

import com.smartmfg.monitor.entity.Notification;
import com.smartmfg.monitor.security.UserPrincipal;
import com.smartmfg.monitor.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "System Notifications", description = "Endpoints for managing user alert feeds.")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get list of notifications matching user context + broadcasts")
    public ResponseEntity<List<Notification>> getNotifications(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<Notification> userAlerts = notificationService.getUserNotifications(userPrincipal.getId());
        List<Notification> broadcastAlerts = notificationService.getBroadcastNotifications();

        List<Notification> combined = new ArrayList<>();
        combined.addAll(userAlerts);
        combined.addAll(broadcastAlerts);
        
        // Sort by date descending
        combined.sort((n1, n2) -> n2.getCreatedAt().compareTo(n1.getCreatedAt()));

        return ResponseEntity.ok(combined);
    }

    @PostMapping("/{id}/read")
    @Operation(summary = "Mark single alert as read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/read-all")
    @Operation(summary = "Mark all user alerts as read")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        notificationService.markAllAsRead(userPrincipal.getId());
        return ResponseEntity.ok().build();
    }
}
