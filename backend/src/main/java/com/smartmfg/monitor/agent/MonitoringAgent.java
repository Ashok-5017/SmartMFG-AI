package com.smartmfg.monitor.agent;

import com.smartmfg.monitor.entity.MachineSensor;
import com.smartmfg.monitor.service.GeminiClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class MonitoringAgent {

    @Autowired
    private GeminiClientService geminiClient;

    private static final String SYSTEM_INSTRUCTION = 
            "You are the MonitoringAgent in a smart factory. Your job is to analyze real-time sensor records and detect anomalies. " +
            "Provide output in strict JSON format matching: { \"anomalyDetected\": boolean, \"metricBreached\": string, \"vibrationLevel\": double, \"temperatureLevel\": double, \"description\": string, \"urgency\": \"LOW\"|\"MEDIUM\"|\"HIGH\"|\"CRITICAL\", \"actionPlan\": string }";

    public String analyzeTelemetry(String machineName, List<MachineSensor> sensors) {
        String sensorDataStr = sensors.stream()
                .map(s -> String.format("[Temp: %.2fC, Pressure: %.2fbar, Vibration: %.2fmm/s, RPM: %.2f, Current: %.2fA at %s]",
                        s.getTemperature(), s.getPressure(), s.getVibration(), s.getRpm(), s.getCurrent(), s.getTimestamp()))
                .collect(Collectors.joining("\\n"));

        String userPrompt = String.format("Machine: %s\\nRecent Telemetry data:\\n%s\\nAnalyze these values and determine if any anomalies exist. Return strict JSON.", machineName, sensorDataStr);

        return geminiClient.generateContent(SYSTEM_INSTRUCTION, userPrompt, false);
    }
}
