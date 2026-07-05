package com.smartmfg.monitor.service;

import com.smartmfg.monitor.dto.MachineDto;
import com.smartmfg.monitor.entity.Machine;
import com.smartmfg.monitor.entity.MachineSensor;
import com.smartmfg.monitor.repository.MachineRepository;
import com.smartmfg.monitor.repository.MachineSensorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SensorDataService {

    @Autowired
    private MachineSensorRepository sensorRepository;

    @Autowired
    private MachineRepository machineRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public MachineSensor recordTelemetry(MachineDto.SensorDataRequest request) {
        Machine machine = machineRepository.findById(request.machineId())
                .orElseThrow(() -> new IllegalArgumentException("Machine not found with ID: " + request.machineId()));

        MachineSensor sensor = MachineSensor.builder()
                .machine(machine)
                .temperature(request.temperature())
                .pressure(request.pressure())
                .vibration(request.vibration())
                .humidity(request.humidity())
                .voltage(request.voltage())
                .current(request.current())
                .rpm(request.rpm())
                .runningHours(request.runningHours())
                .timestamp(LocalDateTime.now())
                .build();

        MachineSensor saved = sensorRepository.save(sensor);
        
        // Evaluate Anomalies and Trigger Alerts
        evaluateAnomalies(machine, saved);

        return saved;
    }

    public List<MachineSensor> getLatestTelemetry(Long machineId, int count) {
        Pageable limit = PageRequest.of(0, count);
        return sensorRepository.findLatestSensors(machineId, limit);
    }

    private void evaluateAnomalies(Machine machine, MachineSensor telemetry) {
        // Temperature Check (> 90°C is CRITICAL, > 80°C is WARNING)
        if (telemetry.getTemperature() >= 90.0) {
            notificationService.broadcastNotification(
                    "CRITICAL: High Temp on " + machine.getName(),
                    "Temperature has spiked to " + telemetry.getTemperature() + "°C. Automated shutdown or inspection required.",
                    "CRITICAL"
            );
            if (!"FAILED".equals(machine.getStatus())) {
                machine.setStatus("FAILED");
                machineRepository.save(machine);
            }
        } else if (telemetry.getTemperature() >= 80.0) {
            notificationService.broadcastNotification(
                    "WARNING: Elevated Temp on " + machine.getName(),
                    "Temperature is elevated at " + telemetry.getTemperature() + "°C. Monitor machine closely.",
                    "WARNING"
            );
        }

        // Vibration Check (> 5.0 mm/s is ALERT)
        if (telemetry.getVibration() >= 5.0) {
            notificationService.broadcastNotification(
                    "ALERT: Extreme Vibration on " + machine.getName(),
                    "Vibration amplitude has exceeded limits: " + telemetry.getVibration() + " mm/s. Bearings might be worn.",
                    "ALERT"
            );
        }

        // Pressure Check (> 22.0 bar is ALERT)
        if (telemetry.getPressure() >= 22.0) {
            notificationService.broadcastNotification(
                    "ALERT: Overpressure on " + machine.getName(),
                    "Pressure reached safety line: " + telemetry.getPressure() + " bar.",
                    "ALERT"
            );
        }
    }
}
