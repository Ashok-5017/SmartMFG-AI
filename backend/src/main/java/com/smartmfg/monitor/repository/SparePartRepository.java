package com.smartmfg.monitor.repository;

import com.smartmfg.monitor.entity.SparePart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SparePartRepository extends JpaRepository<SparePart, Long> {
    Optional<SparePart> findByPartNumber(String partNumber);

    @Query("SELECT p FROM SparePart p WHERE p.stockQuantity <= p.minStockLevel")
    List<SparePart> findLowStockParts();
}
