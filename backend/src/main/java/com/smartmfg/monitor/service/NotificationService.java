package com.smartmfg.monitor.service;

import com.smartmfg.monitor.entity.Notification;
import com.smartmfg.monitor.entity.User;
import com.smartmfg.monitor.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Transactional
    public Notification sendNotification(User user, String title, String message, String type) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type) // INFO, WARNING, ALERT, CRITICAL
                .read(false)
                .build();

        Notification saved = notificationRepository.save(notification);

        // Simulate external Email and SMS dispatch for high-priority alerts
        if ("CRITICAL".equalsIgnoreCase(type) || "ALERT".equalsIgnoreCase(type) || "WARNING".equalsIgnoreCase(type)) {
            String recipientEmail = (user != null) ? user.getEmail() : "oncall-engineers@smartmfg.com";
            String smsPhone = (user != null && "engineer".equalsIgnoreCase(user.getUsername())) ? "+1-555-0102" : "+1-555-0199";

            System.out.println("\n>>> [SIMULATED ALERTS DISPATCH CHANNEL] <<<");
            System.out.println("----------------------------------------------------------------------");
            System.out.println("[SMTP EMAIL SENDER] Sending Alert message to: " + recipientEmail);
            System.out.println("Subject: [" + type + "] " + title);
            System.out.println("Body: " + message);
            System.out.println("Status: SENT (Relayed successfully via Mock SMTP Server)");
            System.out.println("----------------------------------------------------------------------");
            System.out.println("[TWILIO SMS SENDER] Sending Alert message to: " + smsPhone);
            System.out.println("SMS Body: [" + type + "] " + title + " - " + message);
            System.out.println("Status: DELIVERED (Simulated via Twilio Gateway API)");
            System.out.println("----------------------------------------------------------------------\n");
        }

        return saved;
    }

    @Transactional
    public Notification broadcastNotification(String title, String message, String type) {
        return sendNotification(null, title, message, type);
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getBroadcastNotifications() {
        return notificationRepository.findByUserIdIsNullOrderByCreatedAtDesc();
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}
