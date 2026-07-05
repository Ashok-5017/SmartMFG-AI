package com.smartmfg.monitor.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "quality_checks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QualityCheck {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "production_log_id", nullable = false)
    private ProductionLog productionLog;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "inspected_by_id")
    private User inspectedBy;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String status = "PASSED"; // PASSED, FAILED

    @Column(name = "defect_type", length = 100)
    private String defectType;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "checked_at", nullable = false)
    private LocalDateTime checkedAt;

    @PrePersist
    protected void onCreate() {
        if (checkedAt == null) {
            checkedAt = LocalDateTime.now();
        }
    }
}
