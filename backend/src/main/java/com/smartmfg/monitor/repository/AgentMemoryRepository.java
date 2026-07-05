package com.smartmfg.monitor.repository;

import com.smartmfg.monitor.entity.AgentMemory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AgentMemoryRepository extends JpaRepository<AgentMemory, Long> {
    List<AgentMemory> findByConversationIdOrderByTimestampAsc(String conversationId);
    void deleteByConversationId(String conversationId);
}
