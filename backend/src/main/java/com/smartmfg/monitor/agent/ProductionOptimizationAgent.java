package com.smartmfg.monitor.agent;

import com.smartmfg.monitor.service.GeminiClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ProductionOptimizationAgent {

    @Autowired
    private GeminiClientService geminiClient;

    private static final String SYSTEM_INSTRUCTION = 
            "You are the ProductionOptimizationAgent. Your role is to suggest adjustments to feed rates/RPM/speeds to keep manufacturing running safely during component wear. " +
            "Provide output in strict JSON format: { \"efficiencyLossPct\": double, \"suggestedFeedRateAdjustment\": double, \"estimatedCycleTimeIncreaseSecs\": double, \"throughputImpact\": string, \"oeeImpact\": string }";

    public String optimizeThroughput(String machineName, String wearStatus, double currentRpm, double defectiveRate) {
        String userPrompt = String.format("Machine: %s\\nStatus: %s\\nCurrent RPM: %.1f\\nYield Defect Rate: %.2f%%\\nCalculate safe running speed adjustments and estimate production throughput/OEE impact in JSON format.", 
                machineName, wearStatus, currentRpm, defectiveRate);

        return geminiClient.generateContent(SYSTEM_INSTRUCTION, userPrompt, false);
    }
}
