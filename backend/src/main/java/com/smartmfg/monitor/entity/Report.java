package com.smartmfg.monitor.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 50)
    private String type; // DAILY, WEEKLY, MONTHLY, CUSTOM

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "generated_by_id")
    private User generatedBy;

    @Column(name = "file_url")
    private String fileUrl;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
