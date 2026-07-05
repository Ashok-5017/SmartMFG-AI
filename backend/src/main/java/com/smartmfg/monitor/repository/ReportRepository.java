package com.smartmfg.monitor.repository;

import com.smartmfg.monitor.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByTypeOrderByCreatedAtDesc(String type);
}
