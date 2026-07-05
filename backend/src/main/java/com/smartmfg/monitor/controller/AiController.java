package com.smartmfg.monitor.controller;

import com.smartmfg.monitor.dto.AiDto;
import com.smartmfg.monitor.entity.AgentMemory;
import com.smartmfg.monitor.mapper.DtoMapper;
import com.smartmfg.monitor.repository.AgentLogRepository;
import com.smartmfg.monitor.repository.AgentMemoryRepository;
import com.smartmfg.monitor.agent.SupervisorAgent;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI Agent Orchestration", description = "Endpoints for interacting with the Autonomous Supervisor Agent and auditing log trails.")
public class AiController {

    @Autowired
    private SupervisorAgent supervisorAgent;

    @Autowired
    private AgentLogRepository logRepository;

    @Autowired
    private AgentMemoryRepository memoryRepository;

    @PostMapping("/diagnose")
    @Operation(summary = "Invoke the Supervisor Agent to diagnose a machine and recommend actions")
    public ResponseEntity<AiDto.AgentRunResponse> runDiagnostics(@Valid @RequestBody AiDto.AgentRunRequest request) {
        AiDto.AgentRunResponse response = supervisorAgent.runDiagnostic(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/logs")
    @Operation(summary = "Retrieve audit log trails of AI agent operations")
    public ResponseEntity<List<AiDto.AgentLogResponse>> getAgentLogs() {
        List<AiDto.AgentLogResponse> response = logRepository.findFirst50ByOrderByTimestampDesc().stream()
                .map(DtoMapper::toAgentLogResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/chat-history")
    @Operation(summary = "Retrieve dialogue history messages for an AI conversation thread")
    public ResponseEntity<List<AiDto.ChatMessageDto>> getChatHistory(@RequestParam("conversationId") String conversationId) {
        List<AiDto.ChatMessageDto> response = memoryRepository.findByConversationIdOrderByTimestampAsc(conversationId).stream()
                .map(DtoMapper::toChatMessageDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
}
