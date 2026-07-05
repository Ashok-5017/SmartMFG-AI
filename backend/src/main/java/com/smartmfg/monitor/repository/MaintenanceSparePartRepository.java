package com.smartmfg.monitor.repository;

import com.smartmfg.monitor.entity.MaintenanceSparePart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceSparePartRepository extends JpaRepository<MaintenanceSparePart, Long> {
    List<MaintenanceSparePart> findByMaintenanceHistoryId(Long historyId);
}
