package com.smartmfg.monitor.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "agent_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgentLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "agent_name", nullable = false, length = 100)
    private String agentName;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String request;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String response;

    @Column(name = "execution_time_ms", nullable = false)
    private long executionTimeMs;

    @Column(name = "tokens_used")
    @Builder.Default
    private int tokensUsed = 0;

    @Column(nullable = false, length = 50)
    private String status; // SUCCESS, FAILED

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}
