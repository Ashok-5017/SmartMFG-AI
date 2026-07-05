package com.smartmfg.monitor.service;

import com.smartmfg.monitor.dto.MaintenanceDto;
import com.smartmfg.monitor.entity.*;
import com.smartmfg.monitor.exception.ResourceNotFoundException;
import com.smartmfg.monitor.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MaintenanceService {

    @Autowired
    private MaintenanceRequestRepository requestRepository;

    @Autowired
    private MaintenanceHistoryRepository historyRepository;

    @Autowired
    private MaintenanceSparePartRepository maintenanceSparePartRepository;

    @Autowired
    private MachineRepository machineRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SparePartRepository sparePartRepository;

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private NotificationService notificationService;

    public List<MaintenanceRequest> getAllRequests() {
        return requestRepository.findAll();
    }

    public MaintenanceRequest getRequestById(Long id) {
        return requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance Request not found with ID: " + id));
    }

    public List<MaintenanceHistory> getHistoryForMachine(Long machineId) {
        return historyRepository.findByMachineIdOrderByPerformedAtDesc(machineId);
    }

    @Transactional
    public MaintenanceRequest createRequest(MaintenanceDto.MaintenanceRequestDto dto) {
        Machine machine = machineRepository.findById(dto.machineId())
                .orElseThrow(() -> new ResourceNotFoundException("Machine not found with ID: " + dto.machineId()));

        User requester = null;
        if (dto.requestedByUsername() != null) {
            requester = userRepository.findByUsername(dto.requestedByUsername()).orElse(null);
        }

        User assignee = null;
        if (dto.assignedToId() != null) {
            assignee = userRepository.findById(dto.assignedToId()).orElse(null);
        }

        MaintenanceRequest request = MaintenanceRequest.builder()
                .machine(machine)
                .requestedBy(requester)
                .assignedTo(assignee)
                .title(dto.title())
                .description(dto.description())
                .priority(dto.priority() != null ? dto.priority() : "MEDIUM")
                .status("PENDING")
                .build();

        // Update machine status if CRITICAL
        if ("CRITICAL".equalsIgnoreCase(dto.priority())) {
            machine.setStatus("UNDER_MAINTENANCE");
            machineRepository.save(machine);
        }

        MaintenanceRequest saved = requestRepository.save(request);

        // Notify
        notificationService.broadcastNotification(
                "MAINTENANCE: New Request on " + machine.getName(),
                "Work order: '" + saved.getTitle() + "' was submitted with priority " + saved.getPriority(),
                "INFO"
        );

        return saved;
    }

    @Transactional
    public MaintenanceRequest assignRequest(Long requestId, Long userId) {
        MaintenanceRequest request = getRequestById(requestId);
        User assignee = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        request.setAssignedTo(assignee);
        request.setStatus("APPROVED");
        MaintenanceRequest saved = requestRepository.save(request);

        notificationService.sendNotification(
                assignee,
                "TASK ASSIGNED: " + request.getTitle(),
                "You have been assigned to perform maintenance on " + request.getMachine().getName(),
                "INFO"
        );

        return saved;
    }

    @Transactional
    public MaintenanceRequest updateStatus(Long id, String status) {
        MaintenanceRequest request = getRequestById(id);
        request.setStatus(status);
        
        if ("IN_PROGRESS".equalsIgnoreCase(status)) {
            Machine machine = request.getMachine();
            machine.setStatus("UNDER_MAINTENANCE");
            machineRepository.save(machine);
        }

        return requestRepository.save(request);
    }

    @Transactional
    public MaintenanceHistory recordExecution(MaintenanceDto.HistoryRequestDto dto) {
        Machine machine = machineRepository.findById(dto.machineId())
                .orElseThrow(() -> new ResourceNotFoundException("Machine not found with ID: " + dto.machineId()));

        User technician = null;
        if (dto.performedById() != null) {
            technician = userRepository.findById(dto.performedById()).orElse(null);
        }

        MaintenanceRequest request = null;
        if (dto.requestId() != null) {
            request = getRequestById(dto.requestId());
            request.setStatus("COMPLETED");
            requestRepository.save(request);
        }

        // Restore machine status
        machine.setStatus("ACTIVE");
        machineRepository.save(machine);

        MaintenanceHistory history = MaintenanceHistory.builder()
                .machine(machine)
                .request(request)
                .performedBy(technician)
                .actionTaken(dto.actionTaken())
                .downtimeHours(dto.downtimeHours())
                .cost(dto.cost())
                .performedAt(LocalDateTime.now())
                .build();

        MaintenanceHistory savedHistory = historyRepository.save(history);

        // Deduct spare parts inventory
        if (dto.sparePartsUsed() != null) {
            for (MaintenanceDto.SparePartUsageDto spareUsage : dto.sparePartsUsed()) {
                SparePart part = sparePartRepository.findById(spareUsage.sparePartId())
                        .orElseThrow(() -> new ResourceNotFoundException("Spare Part not found with ID: " + spareUsage.sparePartId()));

                MaintenanceSparePart msp = MaintenanceSparePart.builder()
                        .maintenanceHistory(savedHistory)
                        .sparePart(part)
                        .quantityUsed(spareUsage.quantityUsed())
                        .build();

                maintenanceSparePartRepository.save(msp);
                inventoryService.deductStock(part.getId(), spareUsage.quantityUsed());
            }
        }

        notificationService.broadcastNotification(
                "MAINTENANCE COMPLETED: " + machine.getName(),
                "Maintenance execution completed. Downtime: " + dto.downtimeHours() + "h. Cost: $" + dto.cost(),
                "INFO"
        );

        return savedHistory;
    }
}
