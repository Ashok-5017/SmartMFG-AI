package com.smartmfg.monitor.scheduler;

import com.smartmfg.monitor.dto.MachineDto;
import com.smartmfg.monitor.entity.Machine;
import com.smartmfg.monitor.repository.MachineRepository;
import com.smartmfg.monitor.service.SensorDataService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Random;

@Component
@EnableScheduling
public class SensorDataSimulatorScheduler {

    private static final Logger logger = LoggerFactory.getLogger(SensorDataSimulatorScheduler.class);
    private final Random random = new Random();

    @Autowired
    private MachineRepository machineRepository;

    @Autowired
    private SensorDataService sensorDataService;

    // Run every 10 seconds to generate live streams
    @Scheduled(fixedRate = 10000)
    public void simulateTelemetry() {
        List<Machine> machines = machineRepository.findAll();
        if (machines.isEmpty()) {
            return;
        }

        logger.debug("Running telemetry simulation for {} machines", machines.size());

        for (Machine machine : machines) {
            // Only simulate telemetry for ACTIVE or UNDER_MAINTENANCE machines
            if (!"ACTIVE".equals(machine.getStatus()) && !"UNDER_MAINTENANCE".equals(machine.getStatus())) {
                continue;
            }

            try {
                // Generate base values depending on model name to look realistic
                double tempBase = 65.0;
                double vibBase = 1.8;
                double pressBase = 12.0;
                double rpmBase = 1800.0;

                if (machine.getName().contains("Boiler")) {
                    tempBase = 145.0;
                    vibBase = 0.5;
                    pressBase = 15.0;
                    rpmBase = 0.0; // Boilers do not rotate
                } else if (machine.getName().contains("Robotic")) {
                    tempBase = 45.0;
                    vibBase = 1.2;
                    pressBase = 0.0;
                    rpmBase = 300.0;
                } else if (machine.getName().contains("Conveyor")) {
                    tempBase = 38.0;
                    vibBase = 2.1;
                    pressBase = 0.0;
                    rpmBase = 120.0;
                }

                // Add random noise
                double temp = tempBase + (random.nextDouble() * 4.0 - 2.0);
                double vibration = vibBase + (random.nextDouble() * 0.8 - 0.4);
                double pressure = pressBase > 0.0 ? pressBase + (random.nextDouble() * 2.0 - 1.0) : 0.0;
                double rpm = rpmBase > 0.0 ? rpmBase + (random.nextDouble() * 20.0 - 10.0) : 0.0;

                // Induce periodic anomalies on Machine 1 (CNC Spindle friction simulation) to trigger AI
                if (machine.getId() == 1 && random.nextInt(15) == 0) {
                    logger.warn("Simulating thermal friction event on CNC Spindle");
                    temp = 92.5; // Exceeds critical temperature threshold (90C)
                    vibration = 5.6; // Exceeds warning vibration threshold (5.0mm/s)
                }

                MachineDto.SensorDataRequest request = new MachineDto.SensorDataRequest(
                        machine.getId(),
                        temp,
                        pressure,
                        vibration,
                        45.0 + random.nextDouble() * 10, // Humidity
                        400.0 + random.nextDouble() * 30, // Voltage
                        15.0 + random.nextDouble() * 5,   // Current
                        rpm,
                        machine.getId() * 1500.0 + (System.currentTimeMillis() / 3600000.0) % 5000 // Running Hours
                );

                sensorDataService.recordTelemetry(request);
            } catch (Exception e) {
                logger.error("Failed to record simulated telemetry for machine " + machine.getName(), e);
            }
        }
    }
}
