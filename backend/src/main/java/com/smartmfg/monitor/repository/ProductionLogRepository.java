package com.smartmfg.monitor.repository;

import com.smartmfg.monitor.entity.ProductionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductionLogRepository extends JpaRepository<ProductionLog, Long> {
    List<ProductionLog> findByMachineIdOrderByStartTimeDesc(Long machineId);
}
