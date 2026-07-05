package com.smartmfg.monitor.controller;

import com.smartmfg.monitor.dto.MaintenanceDto;
import com.smartmfg.monitor.entity.MaintenanceHistory;
import com.smartmfg.monitor.entity.MaintenanceRequest;
import com.smartmfg.monitor.mapper.DtoMapper;
import com.smartmfg.monitor.service.MaintenanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/maintenance")
@Tag(name = "Maintenance Management", description = "Endpoints for scheduling preventative maintenance, task routing and repair history.")
public class MaintenanceController {

    @Autowired
    private MaintenanceService maintenanceService;

    @GetMapping("/requests")
    @Operation(summary = "Get list of all active maintenance work orders")
    public ResponseEntity<List<MaintenanceDto.MaintenanceResponseDto>> getAllRequests() {
        List<MaintenanceDto.MaintenanceResponseDto> response = maintenanceService.getAllRequests().stream()
                .map(DtoMapper::toMaintenanceResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/requests")
    @Operation(summary = "Submit a new maintenance request")
    public ResponseEntity<MaintenanceDto.MaintenanceResponseDto> createRequest(
            @Valid @RequestBody MaintenanceDto.MaintenanceRequestDto requestDto) {
        MaintenanceRequest request = maintenanceService.createRequest(requestDto);
        return ResponseEntity.ok(DtoMapper.toMaintenanceResponse(request));
    }

    @PostMapping("/requests/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRODUCTION_MANAGER', 'SUPERVISOR')")
    @Operation(summary = "Assign a technician/engineer to a work order")
    public ResponseEntity<MaintenanceDto.MaintenanceResponseDto> assignRequest(
            @PathVariable Long id,
            @RequestParam("userId") Long userId) {
        MaintenanceRequest request = maintenanceService.assignRequest(id, userId);
        return ResponseEntity.ok(DtoMapper.toMaintenanceResponse(request));
    }

    @PutMapping("/requests/{id}/status")
    @Operation(summary = "Change status of a maintenance request (e.g. IN_PROGRESS, CANCELLED)")
    public ResponseEntity<MaintenanceDto.MaintenanceResponseDto> updateStatus(
            @PathVariable Long id,
            @RequestParam("status") String status) {
        MaintenanceRequest request = maintenanceService.updateStatus(id, status);
        return ResponseEntity.ok(DtoMapper.toMaintenanceResponse(request));
    }

    @PostMapping("/history")
    @Operation(summary = "Record execution of a repair, downtime cost, and consumed parts")
    public ResponseEntity<MaintenanceDto.HistoryResponseDto> recordExecution(
            @Valid @RequestBody MaintenanceDto.HistoryRequestDto historyRequest) {
        MaintenanceHistory history = maintenanceService.recordExecution(historyRequest);
        // Map response. For this example we fetch spares through repository or keep empty
        return ResponseEntity.ok(DtoMapper.toHistoryResponse(history, null));
    }

    @GetMapping("/machines/{machineId}/history")
    @Operation(summary = "Retrieve maintenance history for a specific machine")
    public ResponseEntity<List<MaintenanceDto.HistoryResponseDto>> getMachineHistory(@PathVariable Long machineId) {
        List<MaintenanceDto.HistoryResponseDto> response = maintenanceService.getHistoryForMachine(machineId).stream()
                .map(h -> DtoMapper.toHistoryResponse(h, null))
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
}
