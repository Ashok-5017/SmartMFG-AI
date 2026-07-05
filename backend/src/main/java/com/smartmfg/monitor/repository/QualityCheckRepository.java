package com.smartmfg.monitor.repository;

import com.smartmfg.monitor.entity.QualityCheck;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QualityCheckRepository extends JpaRepository<QualityCheck, Long> {
    List<QualityCheck> findByStatus(String status);
}
