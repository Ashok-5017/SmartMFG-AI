package com.smartmfg.monitor.controller;

import com.smartmfg.monitor.dto.InventoryDto;
import com.smartmfg.monitor.entity.SparePart;
import com.smartmfg.monitor.mapper.DtoMapper;
import com.smartmfg.monitor.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/inventory")
@Tag(name = "Inventory Management", description = "Endpoints for tracking spare parts, safety stock levels, and procurement.")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @GetMapping
    @Operation(summary = "Get list of all spare parts in inventory")
    public ResponseEntity<List<InventoryDto.SparePartResponse>> getAllParts() {
        List<InventoryDto.SparePartResponse> response = inventoryService.getAllParts().stream()
                .map(DtoMapper::toSparePartResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/low-stock")
    @Operation(summary = "List spare parts that are currently under safe stock levels")
    public ResponseEntity<List<InventoryDto.SparePartResponse>> getLowStockParts() {
        List<InventoryDto.SparePartResponse> response = inventoryService.getLowStockParts().stream()
                .map(DtoMapper::toSparePartResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_MANAGER')")
    @Operation(summary = "Register a new spare part (Admin/Inventory Manager)")
    public ResponseEntity<InventoryDto.SparePartResponse> addPart(@Valid @RequestBody InventoryDto.SparePartRequest request) {
        SparePart part = inventoryService.addPart(request);
        return ResponseEntity.ok(DtoMapper.toSparePartResponse(part));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_MANAGER')")
    @Operation(summary = "Update spare part properties (Admin/Inventory Manager)")
    public ResponseEntity<InventoryDto.SparePartResponse> updatePart(
            @PathVariable Long id, 
            @Valid @RequestBody InventoryDto.SparePartRequest request) {
        SparePart part = inventoryService.updatePart(id, request);
        return ResponseEntity.ok(DtoMapper.toSparePartResponse(part));
    }

    @PostMapping("/{id}/add-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_MANAGER')")
    @Operation(summary = "Replenish/increment stock quantity for a part")
    public ResponseEntity<InventoryDto.SparePartResponse> addStock(
            @PathVariable Long id, 
            @RequestParam("quantity") int quantity) {
        SparePart part = inventoryService.addStock(id, quantity);
        return ResponseEntity.ok(DtoMapper.toSparePartResponse(part));
    }
}
