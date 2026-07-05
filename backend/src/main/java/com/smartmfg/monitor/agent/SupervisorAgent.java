package com.smartmfg.monitor.agent;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartmfg.monitor.dto.AiDto;
import com.smartmfg.monitor.entity.*;
import com.smartmfg.monitor.repository.*;
import com.smartmfg.monitor.service.GeminiClientService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;

@Component
public class SupervisorAgent {

    private static final Logger logger = LoggerFactory.getLogger(SupervisorAgent.class);

    @Autowired
    private MachineRepository machineRepository;

    @Autowired
    private MachineSensorRepository sensorRepository;

    @Autowired
    private SparePartRepository sparePartRepository;

    @Autowired
    private AgentLogRepository agentLogRepository;

    @Autowired
    private AgentMemoryRepository agentMemoryRepository;

    @Autowired
    private MonitoringAgent monitoringAgent;

    @Autowired
    private PredictiveMaintenanceAgent predictiveMaintenanceAgent;

    @Autowired
    private RcaAgent rcaAgent;

    @Autowired
    private InventoryAgent inventoryAgent;

    @Autowired
    private ProductionOptimizationAgent productionOptimizationAgent;

    @Autowired
    private GeminiClientService geminiClient;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiDto.AgentRunResponse runDiagnostic(AiDto.AgentRunRequest request) {
        long startTime = System.currentTimeMillis();
        String conversationId = request.conversationId();
        if (conversationId == null || conversationId.isEmpty()) {
            conversationId = UUID.randomUUID().toString();
        }

        // Save User Query in Memory
        saveMemory(conversationId, "USER", request.prompt());

        Long machineId = request.machineId();
        Machine machine = null;
        if (machineId != null) {
            machine = machineRepository.findById(machineId).orElse(null);
        }

        // Default outputs
        Map<String, Object> subAgentsOutputs = new HashMap<>();
        List<String> reasoningChain = new ArrayList<>();
        String recommendation = "";
        double confidenceScore = 0.85;
        String status = "SUCCESS";

        try {
            if (machine == null) {
                // If no specific machine, run general supervisor greeting
                String responseText = geminiClient.generateContent(
                        "You are the SupervisorAgent in a manufacturing plant. Answer the user prompt directly.",
                        request.prompt(),
                        false
                );
                recommendation = responseText;
                reasoningChain.add("Received general system query. Direct response generated.");
            } else {
                reasoningChain.add("Initiating diagnostics on Machine: " + machine.getName() + " (" + machine.getSerialNumber() + ")");

                // 1. Fetch latest telemetry
                List<MachineSensor> sensors = sensorRepository.findLatestSensors(machine.getId(), PageRequest.of(0, 10));
                if (sensors.isEmpty()) {
                    recommendation = "No sensor telemetry available for " + machine.getName() + ". Cannot perform diagnosis.";
                    status = "FAILED";
                } else {
                    // 2. Monitoring Agent Anomaly Analysis
                    reasoningChain.add("Invoking MonitoringAgent to parse telemetry streams...");
                    String monJson = monitoringAgent.analyzeTelemetry(machine.getName(), sensors);
                    Map<String, Object> monOut = parseJson(monJson);
                    subAgentsOutputs.put("monitoringAgent", monOut);

                    boolean anomaly = Boolean.TRUE.equals(monOut.get("anomalyDetected"));
                    if (anomaly) {
                        reasoningChain.add("Anomaly detected! Level: " + monOut.get("urgency") + ". Initiating Root Cause Analysis...");

                        // 3. Predictive Maintenance Agent
                        reasoningChain.add("Invoking PredictiveMaintenanceAgent for Remaining Useful Life (RUL) forecasting...");
                        String predJson = predictiveMaintenanceAgent.estimateRemainingLife(machine.getName(), sensors);
                        Map<String, Object> predOut = parseJson(predJson);
                        subAgentsOutputs.put("predictiveAgent", predOut);

                        // 4. Root Cause Analysis
                        reasoningChain.add("Invoking RootCauseAnalysisAgent for diagnostic mapping...");
                        String rcaJson = rcaAgent.analyzeFailure(machine.getName(), "High telemetry warnings", monJson);
                        Map<String, Object> rcaOut = parseJson(rcaJson);
                        subAgentsOutputs.put("rcaAgent", rcaOut);

                        // 5. Inventory check
                        List<String> requiredSpares = (List<String>) rcaOut.get("requiredSpares");
                        String targetPart = (requiredSpares != null && !requiredSpares.isEmpty()) ? requiredSpares.get(0) : "PART-BRG-102";
                        
                        reasoningChain.add("Invoking InventoryAgent to cross-reference stock availability for part: " + targetPart);
                        List<SparePart> allParts = sparePartRepository.findAll();
                        String invJson = inventoryAgent.checkSparesAvailability(targetPart, allParts);
                        Map<String, Object> invOut = parseJson(invJson);
                        subAgentsOutputs.put("inventoryAgent", invOut);

                        // 6. Production Optimization
                        reasoningChain.add("Invoking ProductionOptimizationAgent to estimate yield and feed adjustments...");
                        String prodJson = productionOptimizationAgent.optimizeThroughput(
                                machine.getName(), 
                                "Component wear estimated: " + (predOut.get("componentWearPct") != null ? predOut.get("componentWearPct") : "80") + "%", 
                                sensors.get(0).getRpm(), 
                                4.2
                        );
                        Map<String, Object> prodOut = parseJson(prodJson);
                        subAgentsOutputs.put("productionAgent", prodOut);

                        // 7. Compile recommendation
                        recommendation = String.format(
                                "CRITICAL DIAGNOSTIC OUTCOME: %s has flagged a %s anomaly. " +
                                "The primary cause is estimated to be: %s. " +
                                "Recommended Action: %s. " +
                                "Required spare part is %s (%s). Stock: %s. " +
                                "Temporary mitigation: Reduce RPM by %s%% to maintain safety during wear. Overall OEE impact: %s.",
                                machine.getName(),
                                monOut.get("metricBreached"),
                                rcaOut.get("primaryCause"),
                                rcaOut.get("repairProcedure"),
                                targetPart,
                                Boolean.TRUE.equals(invOut.get("partInStock")) ? "IN STOCK" : "OUT OF STOCK",
                                invOut.get("currentStock"),
                                prodOut.get("suggestedFeedRateAdjustment"),
                                prodOut.get("oeeImpact")
                        );
                        confidenceScore = rcaOut.get("confidenceScore") != null ? Double.parseDouble(rcaOut.get("confidenceScore").toString()) : 0.90;
                    } else {
                        reasoningChain.add("No critical anomalies found by MonitoringAgent. Machine health is within limits.");
                        recommendation = "Diagnosis Complete: " + machine.getName() + " health is stable. Telemetry is within normal parameters.";
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Supervisor execution failed", e);
            status = "FAILED";
            recommendation = "An error occurred during supervisor agent orchestration: " + e.getMessage();
        }

        long duration = System.currentTimeMillis() - startTime;
        reasoningChain.add("Execution finished in " + duration + "ms.");

        // Save Agent Response in Memory
        saveMemory(conversationId, "ASSISTANT", recommendation);

        // Save Audit log of Agent Execution
        AgentLog log = AgentLog.builder()
                .agentName("SupervisorAgent")
                .request(request.prompt() + " (Machine ID: " + machineId + ")")
                .response(recommendation)
                .executionTimeMs(duration)
                .tokensUsed(1200) // Simulated token count
                .status(status)
                .build();
        agentLogRepository.save(log);

        return new AiDto.AgentRunResponse(
                conversationId,
                recommendation,
                status,
                confidenceScore,
                reasoningChain,
                subAgentsOutputs,
                duration
        );
    }

    private void saveMemory(String conversationId, String role, String content) {
        AgentMemory memory = AgentMemory.builder()
                .conversationId(conversationId)
                .role(role)
                .content(content)
                .timestamp(LocalDateTime.now())
                .build();
        agentMemoryRepository.save(memory);
    }

    private Map<String, Object> parseJson(String jsonStr) {
        try {
            // Strip potential markdown formatting e.g. ```json ... ```
            String cleanJson = jsonStr.trim();
            if (cleanJson.startsWith("```json")) {
                cleanJson = cleanJson.substring(7);
            }
            if (cleanJson.endsWith("```")) {
                cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
            }
            cleanJson = cleanJson.trim();

            return objectMapper.readValue(cleanJson, Map.class);
        } catch (Exception e) {
            logger.error("Failed to parse agent JSON. String was: " + jsonStr, e);
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("rawOutput", jsonStr);
            fallback.put("parseError", true);
            return fallback;
        }
    }
}
