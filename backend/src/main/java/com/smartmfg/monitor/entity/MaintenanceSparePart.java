package com.smartmfg.monitor.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "maintenance_spare_parts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceSparePart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "maintenance_history_id", nullable = false)
    private MaintenanceHistory maintenanceHistory;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "spare_part_id", nullable = false)
    private SparePart sparePart;

    @Column(name = "quantity_used", nullable = false)
    @Builder.Default
    private int quantityUsed = 1;
}
