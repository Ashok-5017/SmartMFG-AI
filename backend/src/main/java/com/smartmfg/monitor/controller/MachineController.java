package com.smartmfg.monitor.controller;

import com.smartmfg.monitor.dto.MachineDto;
import com.smartmfg.monitor.entity.Machine;
import com.smartmfg.monitor.entity.MachineSensor;
import com.smartmfg.monitor.mapper.DtoMapper;
import com.smartmfg.monitor.service.MachineService;
import com.smartmfg.monitor.service.SensorDataService;
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
@RequestMapping("/api/machines")
@Tag(name = "Machines & Telemetry", description = "Endpoints for managing industrial machines and fetching sensor graphs.")
public class MachineController {

    @Autowired
    private MachineService machineService;

    @Autowired
    private SensorDataService sensorDataService;

    @GetMapping
    @Operation(summary = "Get list of all machines in the factory")
    public ResponseEntity<List<MachineDto.MachineResponse>> getAllMachines() {
        List<MachineDto.MachineResponse> response = machineService.getAllMachines().stream()
                .map(DtoMapper::toMachineResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detailed metadata for a single machine")
    public ResponseEntity<MachineDto.MachineResponse> getMachineById(@PathVariable Long id) {
        Machine machine = machineService.getMachineById(id);
        return ResponseEntity.ok(DtoMapper.toMachineResponse(machine));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Register a new manufacturing machine (Admin only)")
    public ResponseEntity<MachineDto.MachineResponse> createMachine(@Valid @RequestBody MachineDto.MachineRequest request) {
        Machine machine = machineService.createMachine(request);
        return ResponseEntity.ok(DtoMapper.toMachineResponse(machine));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRODUCTION_MANAGER')")
    @Operation(summary = "Update machine attributes (Admin/Manager)")
    public ResponseEntity<MachineDto.MachineResponse> updateMachine(
            @PathVariable Long id, 
            @Valid @RequestBody MachineDto.MachineRequest request) {
        Machine machine = machineService.updateMachine(id, request);
        return ResponseEntity.ok(DtoMapper.toMachineResponse(machine));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Decommission and delete a machine (Admin only)")
    public ResponseEntity<Void> deleteMachine(@PathVariable Long id) {
        machineService.deleteMachine(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/telemetry")
    @Operation(summary = "Retrieve recent sensor readings for charts")
    public ResponseEntity<List<MachineDto.SensorDataResponse>> getTelemetry(
            @PathVariable Long id,
            @RequestParam(value = "limit", defaultValue = "30") int limit) {
        List<MachineDto.SensorDataResponse> response = sensorDataService.getLatestTelemetry(id, limit).stream()
                .map(DtoMapper::toSensorDataResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/telemetry")
    @Operation(summary = "Ingest new simulated sensor telemetry data")
    public ResponseEntity<MachineDto.SensorDataResponse> pushTelemetry(@Valid @RequestBody MachineDto.SensorDataRequest request) {
        MachineSensor sensor = sensorDataService.recordTelemetry(request);
        return ResponseEntity.ok(DtoMapper.toSensorDataResponse(sensor));
    }
}
