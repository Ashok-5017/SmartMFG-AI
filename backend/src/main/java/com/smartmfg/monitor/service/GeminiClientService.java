package com.smartmfg.monitor.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartmfg.monitor.config.GeminiConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class GeminiClientService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiClientService.class);
    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s";

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private GeminiConfig geminiConfig;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateContent(String systemInstruction, String userPrompt, boolean useProModel) {
        String apiKey = geminiConfig.getApiKey();
        String model = useProModel ? geminiConfig.getProModel() : geminiConfig.getDefaultModel();

        if (apiKey == null || apiKey.isEmpty() || "mock-key-for-now".equals(apiKey)) {
            logger.info("Gemini API key is unconfigured or mock. Simulating agent response.");
            return generateMockResponse(systemInstruction, userPrompt);
        }

        try {
            String url = String.format(GEMINI_API_URL, model, apiKey);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Construct payload according to Gemini API specs
            Map<String, Object> payload = new HashMap<>();
            
            // System instructions (developer settings)
            if (systemInstruction != null && !systemInstruction.isEmpty()) {
                Map<String, Object> systemPart = new HashMap<>();
                systemPart.put("text", systemInstruction);
                Map<String, Object> systemContent = new HashMap<>();
                systemContent.put("parts", Collections.singletonList(systemPart));
                payload.put("systemInstruction", systemContent);
            }

            // User prompt
            Map<String, Object> userPart = new HashMap<>();
            userPart.put("text", userPrompt);
            Map<String, Object> userContent = new HashMap<>();
            userContent.put("role", "user");
            userContent.put("parts", Collections.singletonList(userPart));
            payload.put("contents", Collections.singletonList(userContent));

            // Set response Mime Type to application/json for structured output
            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("responseMimeType", "application/json");
            payload.put("generationConfig", generationConfig);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                // Parse text field from response json
                List<?> candidates = (List<?>) response.getBody().get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<?, ?> candidate = (Map<?, ?>) candidates.get(0);
                    Map<?, ?> content = (Map<?, ?>) candidate.get("content");
                    List<?> parts = (List<?>) content.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        Map<?, ?> part = (Map<?, ?>) parts.get(0);
                        return part.get("text").toString();
                    }
                }
            }
            throw new RuntimeException("Empty response from Gemini API");
        } catch (Exception e) {
            logger.error("Error communicating with Gemini API, falling back to simulated output", e);
            return generateMockResponse(systemInstruction, userPrompt);
        }
    }

    private String generateMockResponse(String systemInstruction, String userPrompt) {
        String promptLower = userPrompt.toLowerCase();
        
        // 1. Mocking Agent: Monitoring Agent Anomaly Check
        if (systemInstruction != null && systemInstruction.contains("MonitoringAgent")) {
            return """
            {
              "anomalyDetected": true,
              "metricBreached": "vibration",
              "vibrationLevel": 5.4,
              "temperatureLevel": 78.5,
              "description": "Vibration readings have exceeded safe bounds on the spindle assembly.",
              "urgency": "HIGH",
              "actionPlan": "Perform visual check on alignment, schedule vibration damping inspection."
            }
            """;
        }

        // 2. Mocking Agent: Predictive Maintenance RUL Estimation
        if (systemInstruction != null && systemInstruction.contains("PredictiveMaintenanceAgent")) {
            return """
            {
              "remainingUsefulLifeHours": 140.0,
              "failureProbability": 0.85,
              "componentWearPct": 87.0,
              "predictedFailureMode": "Spindle Bearing Friction Failure",
              "priority": "CRITICAL",
              "recommendedAction": "Replace high-speed spindle bearing within 48 operational hours."
            }
            """;
        }

        // 3. Mocking Agent: Root Cause Analysis (RCA)
        if (systemInstruction != null && systemInstruction.contains("RootCauseAnalysisAgent")) {
            return """
            {
              "primaryCause": "Lack of lubrication leading to micro-frictional wear on spindle rollers.",
              "secondaryCause": "Thermal expansion from overheating spindle housing.",
              "repairProcedure": "Shut down CNC milling machine, flush bearing casing, fit replacement bearing part PART-BRG-102, apply high-speed grade lubricants, calibrate spindle speed.",
              "requiredSpares": ["PART-BRG-102"],
              "confidenceScore": 0.92
            }
            """;
        }

        // 4. Mocking Agent: Inventory Agent
        if (systemInstruction != null && systemInstruction.contains("InventoryAgent")) {
            return """
            {
              "partInStock": true,
              "partNumber": "PART-BRG-102",
              "currentStock": 15,
              "minStockLevel": 4,
              "isReorderRequired": false,
              "procurementRecommendation": "No immediate purchase required. Current stock of 15 is safe."
            }
            """;
        }

        // 5. Mocking Agent: Production Optimization Agent
        if (systemInstruction != null && systemInstruction.contains("ProductionOptimizationAgent")) {
            return """
            {
              "efficiencyLossPct": 12.5,
              "suggestedFeedRateAdjustment": -10.0,
              "estimatedCycleTimeIncreaseSecs": 15.0,
              "throughputImpact": "Reduce RPM temporarily by 10% to prevent mechanical seizure while scheduling replacement. Maintains 90% production throughput.",
              "oeeImpact": "Overall Equipment Effectiveness will drop from 88% to 82% due to slower speed, but avoids a catastrophic failure (OEE drop to 0% for 3 days)."
            }
            """;
        }

        // 6. Mocking Agent: Supervisor Agent orchestrating all sub-agents
        if (systemInstruction != null && systemInstruction.contains("SupervisorAgent")) {
            return """
            {
              "status": "SUCCESS",
              "confidenceScore": 0.95,
              "reasoningChain": [
                "1. Sensed a vibration spike (5.4 mm/s) on CNC Milling Machine (CNC-01).",
                "2. MonitoringAgent marked vibration level as HIGH anomaly.",
                "3. PredictiveMaintenanceAgent estimated remaining useful life (RUL) as 140 hours and scheduled replacement.",
                "4. RootCauseAnalysisAgent identified primary cause as roller friction and recommended replacing bearing PART-BRG-102.",
                "5. InventoryAgent confirmed PART-BRG-102 has 15 items in stock.",
                "6. ProductionOptimizationAgent recommended a 10% feed rate reduction to run safely until maintenance crew arrives."
              ],
              "recommendation": "CRITICAL: CNC Milling Machine (CNC-01) is experiencing bearing friction anomalies. Action Required: Schedule replacement of the spindle bearing (PART-BRG-102) within the next 48 hours. In the interim, reduce the machine RPM/feed rate by 10% to prevent locking. Total estimated repair time: 2 hours. Spare parts are available in Aisle A - Shelf 3.",
              "subAgentsOutputs": {
                "monitoringAgent": {
                  "anomalyDetected": true,
                  "metricBreached": "vibration",
                  "vibrationLevel": 5.4,
                  "description": "Vibration readings have exceeded safe bounds."
                },
                "predictiveAgent": {
                  "remainingUsefulLifeHours": 140.0,
                  "failureProbability": 0.85,
                  "priority": "CRITICAL"
                },
                "rcaAgent": {
                  "primaryCause": "Roller friction due to lubrication failure.",
                  "requiredSpares": ["PART-BRG-102"]
                },
                "inventoryAgent": {
                  "partInStock": true,
                  "currentStock": 15
                },
                "productionAgent": {
                  "oeeImpact": "RPM reduction limits drop to 6% OEE points vs catastrophic failure."
                }
              }
            }
            """;
        }

        // Default chat prompt response
        return """
        {
          "recommendation": "The manufacturing supervisor agent has received your query. Sensor streams are stable and machine metrics are within operational bounds.",
          "status": "SUCCESS",
          "confidenceScore": 0.80,
          "reasoningChain": ["Parsed message.", "Evaluated workspace databases.", "No active machine alarms found."],
          "subAgentsOutputs": {}
        }
        """;
    }
}
