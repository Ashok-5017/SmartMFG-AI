package com.smartmfg.monitor.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class MaintenanceDto {

    public record MaintenanceRequestDto(
        @NotNull(message = "Machine ID is required")
        Long machineId,
        String requestedByUsername,
        Long assignedToId,
        
        @NotBlank(message = "Title is required")
        String title,
        
        @NotBlank(message = "Description is required")
        String description,
        
        String priority, // LOW, MEDIUM, HIGH, CRITICAL
        String status    // PENDING, APPROVED, IN_PROGRESS, COMPLETED, CANCELLED
    ) {}

    public record MaintenanceResponseDto(
        Long id,
        Long machineId,
        String machineName,
        String machineSerialNumber,
        Long requestedById,
        String requestedByUsername,
        Long assignedToId,
        String assignedToUsername,
        String title,
        String description,
        String priority,
        String status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
    ) {}

    public record SparePartUsageDto(
        @NotNull Long sparePartId,
        String sparePartName,
        String partNumber,
        int quantityUsed
    ) {}

    public record HistoryRequestDto(
        @NotNull Long machineId,
        Long requestId,
        Long performedById,
        
        @NotBlank String actionTaken,
        double downtimeHours,
        @NotNull BigDecimal cost,
        List<SparePartUsageDto> sparePartsUsed
    ) {}

    public record HistoryResponseDto(
        Long id,
        Long machineId,
        String machineName,
        Long requestId,
        String requestTitle,
        Long performedById,
        String performedByUsername,
        String actionTaken,
        double downtimeHours,
        BigDecimal cost,
        LocalDateTime performedAt,
        List<SparePartUsageDto> sparePartsUsed
    ) {}
}
