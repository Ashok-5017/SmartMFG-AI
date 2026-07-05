package com.smartmfg.monitor.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class InventoryDto {

    public record SparePartRequest(
        @NotBlank(message = "Part name is required")
        String name,

        @NotBlank(message = "Part number is required")
        String partNumber,

        @Min(value = 0, message = "Stock quantity cannot be negative")
        int stockQuantity,

        @Min(value = 0, message = "Minimum stock level cannot be negative")
        int minStockLevel,

        @NotNull(message = "Cost is required")
        BigDecimal cost,

        @NotBlank(message = "Warehouse location is required")
        String location
    ) {}

    public record SparePartResponse(
        Long id,
        String name,
        String partNumber,
        int stockQuantity,
        int minStockLevel,
        BigDecimal cost,
        String location,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
    ) {}
}
