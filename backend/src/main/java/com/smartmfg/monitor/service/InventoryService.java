package com.smartmfg.monitor.service;

import com.smartmfg.monitor.dto.InventoryDto;
import com.smartmfg.monitor.entity.SparePart;
import com.smartmfg.monitor.exception.ResourceNotFoundException;
import com.smartmfg.monitor.repository.SparePartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class InventoryService {

    @Autowired
    private SparePartRepository sparePartRepository;

    @Autowired
    private NotificationService notificationService;

    public List<SparePart> getAllParts() {
        return sparePartRepository.findAll();
    }

    public SparePart getPartById(Long id) {
        return sparePartRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Spare Part not found with ID: " + id));
    }

    public List<SparePart> getLowStockParts() {
        return sparePartRepository.findLowStockParts();
    }

    @Transactional
    public SparePart addPart(InventoryDto.SparePartRequest request) {
        SparePart part = SparePart.builder()
                .name(request.name())
                .partNumber(request.partNumber())
                .stockQuantity(request.stockQuantity())
                .minStockLevel(request.minStockLevel())
                .cost(request.cost())
                .location(request.location())
                .build();
        
        SparePart saved = sparePartRepository.save(part);
        checkStockLevelAndNotify(saved);
        return saved;
    }

    @Transactional
    public SparePart updatePart(Long id, InventoryDto.SparePartRequest request) {
        SparePart part = getPartById(id);
        part.setName(request.name());
        part.setPartNumber(request.partNumber());
        part.setStockQuantity(request.stockQuantity());
        part.setMinStockLevel(request.minStockLevel());
        part.setCost(request.cost());
        part.setLocation(request.location());

        SparePart saved = sparePartRepository.save(part);
        checkStockLevelAndNotify(saved);
        return saved;
    }

    @Transactional
    public SparePart addStock(Long id, int quantity) {
        SparePart part = getPartById(id);
        part.setStockQuantity(part.getStockQuantity() + quantity);
        return sparePartRepository.save(part);
    }

    @Transactional
    public void deductStock(Long id, int quantity) {
        SparePart part = getPartById(id);
        if (part.getStockQuantity() < quantity) {
            // Log warning but still deduct/go to zero or negative to represent deficit
            part.setStockQuantity(0);
        } else {
            part.setStockQuantity(part.getStockQuantity() - quantity);
        }
        SparePart saved = sparePartRepository.save(part);
        checkStockLevelAndNotify(saved);
    }

    private void checkStockLevelAndNotify(SparePart part) {
        if (part.getStockQuantity() <= part.getMinStockLevel()) {
            notificationService.broadcastNotification(
                    "INVENTORY: Low Stock on " + part.getName(),
                    "Spare part " + part.getName() + " (" + part.getPartNumber() + ") stock is at " 
                    + part.getStockQuantity() + " (Minimum required: " + part.getMinStockLevel() + "). Please reorder immediately.",
                    "WARNING"
            );
        }
    }
}
