package com.smartmfg.monitor.repository;

import com.smartmfg.monitor.entity.MachineSensor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MachineSensorRepository extends JpaRepository<MachineSensor, Long> {
    List<MachineSensor> findByMachineIdOrderByTimestampDesc(Long machineId, Pageable pageable);

    @Query("SELECT s FROM MachineSensor s WHERE s.machine.id = :machineId ORDER BY s.timestamp DESC")
    List<MachineSensor> findLatestSensors(@Param("machineId") Long machineId, Pageable pageable);
}
