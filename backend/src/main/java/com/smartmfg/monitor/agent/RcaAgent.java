package com.smartmfg.monitor.agent;

import com.smartmfg.monitor.service.GeminiClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class RcaAgent {

    @Autowired
    private GeminiClientService geminiClient;

    private static final String SYSTEM_INSTRUCTION = 
            "You are the RootCauseAnalysisAgent (RCA). Your task is to diagnose failure origins and detail maintenance procedures. " +
            "Provide output in strict JSON format: { \"primaryCause\": string, \"secondaryCause\": string, \"repairProcedure\": string, \"requiredSpares\": [string], \"confidenceScore\": double }";

    public String analyzeFailure(String machineName, String errorLog, String sensorSnippet) {
        String userPrompt = String.format("Machine: %s\\nEvent/Error Log: %s\\nTelemetry around breach: %s\\nState the root cause and repair procedure in JSON format.", 
                machineName, errorLog, sensorSnippet);

        return geminiClient.generateContent(SYSTEM_INSTRUCTION, userPrompt, true); // Use Pro model for heavy reasoning
    }
}
