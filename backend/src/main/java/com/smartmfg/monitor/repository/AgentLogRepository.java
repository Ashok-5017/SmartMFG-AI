package com.smartmfg.monitor.repository;

import com.smartmfg.monitor.entity.AgentLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AgentLogRepository extends JpaRepository<AgentLog, Long> {
    List<AgentLog> findByAgentNameOrderByTimestampDesc(String agentName);
    List<AgentLog> findFirst50ByOrderByTimestampDesc();
}
