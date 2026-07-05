package com.smartmfg.monitor.service;

import com.smartmfg.monitor.dto.MachineDto;
import com.smartmfg.monitor.entity.Machine;
import com.smartmfg.monitor.exception.ResourceNotFoundException;
import com.smartmfg.monitor.repository.MachineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MachineService {

    @Autowired
    private MachineRepository machineRepository;

    public List<Machine> getAllMachines() {
        return machineRepository.findAll();
    }

    public Machine getMachineById(Long id) {
        return machineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Machine not found with ID: " + id));
    }

    @Transactional
    public Machine createMachine(MachineDto.MachineRequest request) {
        Machine machine = Machine.builder()
                .name(request.name())
                .serialNumber(request.serialNumber())
                .model(request.model())
                .location(request.location())
                .status("ACTIVE")
                .imageUrl(request.imageUrl() != null ? request.imageUrl() : "")
                .build();
        return machineRepository.save(machine);
    }

    @Transactional
    public Machine updateMachine(Long id, MachineDto.MachineRequest request) {
        Machine machine = getMachineById(id);
        machine.setName(request.name());
        machine.setSerialNumber(request.serialNumber());
        machine.setModel(request.model());
        machine.setLocation(request.location());
        if (request.status() != null) {
            machine.setStatus(request.status());
        }
        if (request.imageUrl() != null) {
            machine.setImageUrl(request.imageUrl());
        }
        return machineRepository.save(machine);
    }

    @Transactional
    public Machine updateStatus(Long id, String status) {
        Machine machine = getMachineById(id);
        machine.setStatus(status);
        return machineRepository.save(machine);
    }

    @Transactional
    public void deleteMachine(Long id) {
        Machine machine = getMachineById(id);
        machineRepository.delete(machine);
    }
}
