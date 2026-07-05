package com.smartmfg.monitor.repository;

import com.smartmfg.monitor.entity.MaintenanceHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceHistoryRepository extends JpaRepository<MaintenanceHistory, Long> {
    List<MaintenanceHistory> findByMachineIdOrderByPerformedAtDesc(Long machineId);
}
