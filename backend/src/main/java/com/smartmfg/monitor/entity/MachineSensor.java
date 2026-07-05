package com.smartmfg.monitor.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "machine_sensors",
    indexes = {
        @Index(name = "idx_sensors_machine_timestamp", columnList = "machine_id, timestamp DESC")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MachineSensor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "machine_id", nullable = false)
    private Machine machine;

    @Column(nullable = false)
    private double temperature;

    @Column(nullable = false)
    private double pressure;

    @Column(nullable = false)
    private double vibration;

    @Column(nullable = false)
    private double humidity;

    @Column(nullable = false)
    private double voltage;

    @Column(nullable = false)
    private double current;

    @Column(nullable = false)
    private double rpm;

    @Column(name = "running_hours", nullable = false)
    private double runningHours;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}
