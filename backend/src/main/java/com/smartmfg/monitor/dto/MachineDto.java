package com.smartmfg.monitor.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class MachineDto {

    public record MachineRequest(
        @NotBlank(message = "Machine name is required")
        String name,

        @NotBlank(message = "Serial number is required")
        String serialNumber,

        @NotBlank(message = "Model is required")
        String model,

        @NotBlank(message = "Location is required")
        String location,

        String status,
        String imageUrl
    ) {}

    public record MachineResponse(
        Long id,
        String name,
        String serialNumber,
        String model,
        String location,
        String status,
        String imageUrl,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
    ) {}

    public record SensorDataRequest(
        @NotNull(message = "Machine ID is required")
        Long machineId,
        double temperature,
        double pressure,
        double vibration,
        double humidity,
        double voltage,
        double current,
        double rpm,
        double runningHours
    ) {}

    public record SensorDataResponse(
        Long id,
        Long machineId,
        String machineName,
        double temperature,
        double pressure,
        double vibration,
        double humidity,
        double voltage,
        double current,
        double rpm,
        double runningHours,
        LocalDateTime timestamp
    ) {}
}
