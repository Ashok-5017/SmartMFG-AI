package com.smartmfg.monitor.mapper;

import com.smartmfg.monitor.dto.*;
import com.smartmfg.monitor.entity.*;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class DtoMapper {

    public static AuthDto.UserResponse toUserResponse(User user) {
        if (user == null) return null;
        return new AuthDto.UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.isEnabled(),
                user.isVerified(),
                user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()),
                user.getCreatedAt()
        );
    }

    public static MachineDto.MachineResponse toMachineResponse(Machine machine) {
        if (machine == null) return null;
        return new MachineDto.MachineResponse(
                machine.getId(),
                machine.getName(),
                machine.getSerialNumber(),
                machine.getModel(),
                machine.getLocation(),
                machine.getStatus(),
                machine.getImageUrl(),
                machine.getCreatedAt(),
                machine.getUpdatedAt()
        );
    }

    public static MachineDto.SensorDataResponse toSensorDataResponse(MachineSensor sensor) {
        if (sensor == null) return null;
        return new MachineDto.SensorDataResponse(
                sensor.getId(),
                sensor.getMachine().getId(),
                sensor.getMachine().getName(),
                sensor.getTemperature(),
                sensor.getPressure(),
                sensor.getVibration(),
                sensor.getHumidity(),
                sensor.getVoltage(),
                sensor.getCurrent(),
                sensor.getRpm(),
                sensor.getRunningHours(),
                sensor.getTimestamp()
        );
    }

    public static MaintenanceDto.MaintenanceResponseDto toMaintenanceResponse(MaintenanceRequest request) {
        if (request == null) return null;
        return new MaintenanceDto.MaintenanceResponseDto(
                request.getId(),
                request.getMachine().getId(),
                request.getMachine().getName(),
                request.getMachine().getSerialNumber(),
                request.getRequestedBy() != null ? request.getRequestedBy().getId() : null,
                request.getRequestedBy() != null ? request.getRequestedBy().getUsername() : "System",
                request.getAssignedTo() != null ? request.getAssignedTo().getId() : null,
                request.getAssignedTo() != null ? request.getAssignedTo().getUsername() : "Unassigned",
                request.getTitle(),
                request.getDescription(),
                request.getPriority(),
                request.getStatus(),
                request.getCreatedAt(),
                request.getUpdatedAt()
        );
    }

    public static MaintenanceDto.HistoryResponseDto toHistoryResponse(MaintenanceHistory history, List<MaintenanceSparePart> spares) {
        if (history == null) return null;
        return new MaintenanceDto.HistoryResponseDto(
                history.getId(),
                history.getMachine().getId(),
                history.getMachine().getName(),
                history.getRequest() != null ? history.getRequest().getId() : null,
                history.getRequest() != null ? history.getRequest().getTitle() : "Direct Maintenance Action",
                history.getPerformedBy() != null ? history.getPerformedBy().getId() : null,
                history.getPerformedBy() != null ? history.getPerformedBy().getUsername() : "System/Agent",
                history.getActionTaken(),
                history.getDowntimeHours(),
                history.getCost(),
                history.getPerformedAt(),
                spares == null ? Collections.emptyList() : spares.stream()
                        .map(sp -> new MaintenanceDto.SparePartUsageDto(
                                sp.getSparePart().getId(),
                                sp.getSparePart().getName(),
                                sp.getSparePart().getPartNumber(),
                                sp.getQuantityUsed()
                        )).collect(Collectors.toList())
        );
    }

    public static InventoryDto.SparePartResponse toSparePartResponse(SparePart part) {
        if (part == null) return null;
        return new InventoryDto.SparePartResponse(
                part.getId(),
                part.getName(),
                part.getPartNumber(),
                part.getStockQuantity(),
                part.getMinStockLevel(),
                part.getCost(),
                part.getLocation(),
                part.getCreatedAt(),
                part.getUpdatedAt()
        );
    }

    public static AiDto.AgentLogResponse toAgentLogResponse(AgentLog log) {
        if (log == null) return null;
        return new AiDto.AgentLogResponse(
                log.getId(),
                log.getAgentName(),
                log.getRequest(),
                log.getResponse(),
                log.getExecutionTimeMs(),
                log.getTokensUsed(),
                log.getStatus(),
                log.getTimestamp()
        );
    }

    public static AiDto.ChatMessageDto toChatMessageDto(AgentMemory memory) {
        if (memory == null) return null;
        return new AiDto.ChatMessageDto(
                memory.getRole(),
                memory.getContent(),
                memory.getTimestamp()
        );
    }
}
