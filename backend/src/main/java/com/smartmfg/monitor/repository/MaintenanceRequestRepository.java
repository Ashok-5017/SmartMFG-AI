package com.smartmfg.monitor.repository;

import com.smartmfg.monitor.entity.MaintenanceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, Long> {
    List<MaintenanceRequest> findByMachineIdOrderByCreatedAtDesc(Long machineId);
    List<MaintenanceRequest> findByAssignedToId(Long userId);
    List<MaintenanceRequest> findByStatus(String status);
}
