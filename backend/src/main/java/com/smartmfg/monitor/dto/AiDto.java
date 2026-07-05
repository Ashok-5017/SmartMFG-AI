package com.smartmfg.monitor.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class AiDto {

    public record AgentRunRequest(
        @NotBlank(message = "Message prompt is required")
        String prompt,
        
        Long machineId,
        String conversationId
    ) {}

    public record AgentRunResponse(
        String conversationId,
        String recommendation,
        String status, // SUCCESS, FAILED
        double confidenceScore,
        List<String> reasoningChain,
        Map<String, Object> subAgentsOutputs,
        long executionTimeMs
    ) {}

    public record AgentLogResponse(
        Long id,
        String agentName,
        String request,
        String response,
        long executionTimeMs,
        int tokensUsed,
        String status,
        LocalDateTime timestamp
    ) {}

    public record ChatMessageDto(
        String role, // USER, ASSISTANT, SYSTEM
        String content,
        LocalDateTime timestamp
    ) {}
}
