package com.smartmfg.monitor.agent;

import com.smartmfg.monitor.entity.MachineSensor;
import com.smartmfg.monitor.service.GeminiClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class PredictiveMaintenanceAgent {

    @Autowired
    private GeminiClientService geminiClient;

    private static final String SYSTEM_INSTRUCTION = 
            "You are the PredictiveMaintenanceAgent. Your job is to estimate the Remaining Useful Life (RUL) in hours, calculate failure probability (0.0 to 1.0), and component wear percentage based on sensor trends and historical operating hours. " +
            "Provide output in strict JSON format matching: { \"remainingUsefulLifeHours\": double, \"failureProbability\": double, \"componentWearPct\": double, \"predictedFailureMode\": string, \"priority\": \"LOW\"|\"MEDIUM\"|\"HIGH\"|\"CRITICAL\", \"recommendedAction\": string }";

    public String estimateRemainingLife(String machineName, List<MachineSensor> sensors) {
        String dataPoints = sensors.stream()
                .map(s -> String.format("[Hours: %.1fh, Temp: %.1fC, Vib: %.1fmm/s]", s.getRunningHours(), s.getTemperature(), s.getVibration()))
                .collect(Collectors.joining("\\n"));

        String userPrompt = String.format("Machine: %s\\nTelemetry trends:\\n%s\\nPerform degradation analysis, estimate RUL, and output the response in JSON format.", machineName, dataPoints);

        return geminiClient.generateContent(SYSTEM_INSTRUCTION, userPrompt, false);
    }
}
