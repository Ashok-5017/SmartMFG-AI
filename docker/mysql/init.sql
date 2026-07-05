-- MySQL Database Initialization Script for AI Smart Manufacturing System

CREATE DATABASE IF NOT EXISTS smart_mfg;
USE smart_mfg;

-- 1. ROLES TABLE
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. USER ROLES JOIN TABLE
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. MACHINES TABLE
CREATE TABLE IF NOT EXISTS machines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) NOT NULL UNIQUE,
    model VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, UNDER_MAINTENANCE, FAILED, IDLE
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. MACHINE SENSORS TIME-SERIES TABLE
CREATE TABLE IF NOT EXISTS machine_sensors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    machine_id BIGINT NOT NULL,
    temperature DOUBLE NOT NULL,
    pressure DOUBLE NOT NULL,
    vibration DOUBLE NOT NULL,
    humidity DOUBLE NOT NULL,
    voltage DOUBLE NOT NULL,
    current DOUBLE NOT NULL,
    rpm DOUBLE NOT NULL,
    running_hours DOUBLE NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sensors_machine FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_sensors_machine_timestamp ON machine_sensors(machine_id, timestamp DESC);

-- 6. MAINTENANCE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS maintenance_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    machine_id BIGINT NOT NULL,
    requested_by_id BIGINT,
    assigned_to_id BIGINT,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, IN_PROGRESS, COMPLETED, CANCELLED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_mr_machine FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE,
    CONSTRAINT fk_mr_requested_by FOREIGN KEY (requested_by_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_mr_assigned_to FOREIGN KEY (assigned_to_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. MAINTENANCE HISTORY TABLE
CREATE TABLE IF NOT EXISTS maintenance_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    machine_id BIGINT NOT NULL,
    request_id BIGINT,
    performed_by_id BIGINT,
    action_taken TEXT NOT NULL,
    downtime_hours DOUBLE NOT NULL DEFAULT 0.0,
    cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mh_machine FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE,
    CONSTRAINT fk_mh_request FOREIGN KEY (request_id) REFERENCES maintenance_requests(id) ON DELETE SET NULL,
    CONSTRAINT fk_mh_performed_by FOREIGN KEY (performed_by_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. SPARE PARTS INVENTORY TABLE
CREATE TABLE IF NOT EXISTS spare_parts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    part_number VARCHAR(100) NOT NULL UNIQUE,
    stock_quantity INT NOT NULL DEFAULT 0,
    min_stock_level INT NOT NULL DEFAULT 5,
    cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    location VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. MAINTENANCE SPARE PARTS JOIN TABLE (Parts consumed during maintenance)
CREATE TABLE IF NOT EXISTS maintenance_spare_parts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    maintenance_history_id BIGINT NOT NULL,
    spare_part_id BIGINT NOT NULL,
    quantity_used INT NOT NULL DEFAULT 1,
    CONSTRAINT fk_msp_history FOREIGN KEY (maintenance_history_id) REFERENCES maintenance_history(id) ON DELETE CASCADE,
    CONSTRAINT fk_msp_part FOREIGN KEY (spare_part_id) REFERENCES spare_parts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. PRODUCTION LOGS TABLE
CREATE TABLE IF NOT EXISTS production_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    machine_id BIGINT NOT NULL,
    units_produced INT NOT NULL DEFAULT 0,
    units_defective INT NOT NULL DEFAULT 0,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pl_machine FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. QUALITY CHECKS TABLE
CREATE TABLE IF NOT EXISTS quality_checks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    production_log_id BIGINT NOT NULL,
    inspected_by_id BIGINT,
    status VARCHAR(50) NOT NULL DEFAULT 'PASSED', -- PASSED, FAILED
    defect_type VARCHAR(100),
    notes TEXT,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_qc_production FOREIGN KEY (production_log_id) REFERENCES production_logs(id) ON DELETE CASCADE,
    CONSTRAINT fk_qc_inspected_by FOREIGN KEY (inspected_by_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. REPORTS TABLE
CREATE TABLE IF NOT EXISTS reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL, -- DAILY, WEEKLY, MONTHLY, CUSTOM
    generated_by_id BIGINT,
    file_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reports_generated_by FOREIGN KEY (generated_by_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT, -- NULL implies broadcast to all
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'INFO', -- INFO, WARNING, ALERT, CRITICAL
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. AGENT LOGS TABLE (For tracing Agent actions)
CREATE TABLE IF NOT EXISTS agent_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    agent_name VARCHAR(100) NOT NULL,
    request TEXT NOT NULL,
    response TEXT NOT NULL,
    execution_time_ms BIGINT NOT NULL,
    tokens_used INT DEFAULT 0,
    status VARCHAR(50) NOT NULL, -- SUCCESS, FAILED
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. AGENT MEMORY TABLE (Conversational context per machine/session)
CREATE TABLE IF NOT EXISTS agent_memory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL, -- USER, ASSISTANT, SYSTEM
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_agent_memory_convo ON agent_memory(conversation_id);

-- 16. KNOWLEDGE DOCUMENTS TABLE (RAG files reference tracker)
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    content_type VARCHAR(50) NOT NULL, -- MANUAL, SOP, TROUBLESHOOTING
    file_url VARCHAR(255) NOT NULL,
    vector_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================================
-- SEED DATA
-- =========================================================================

-- Seed Roles
INSERT INTO roles (name) VALUES 
('ROLE_ADMIN'), 
('ROLE_MAINTENANCE_ENGINEER'), 
('ROLE_PRODUCTION_MANAGER'), 
('ROLE_OPERATOR'), 
('ROLE_INVENTORY_MANAGER'), 
('ROLE_SUPERVISOR');

-- Seed Users (Password is bcrypt for 'Password123')
INSERT INTO users (username, email, password, enabled, verified) VALUES
('admin', 'admin@smartmfg.com', '$2a$10$jykx9QGtAbVKOVsDwOPiw.6SEhFm7AsNuEkmu0ub39Jo0jA.tSKSG', 1, 1),
('engineer', 'engineer@smartmfg.com', '$2a$10$jykx9QGtAbVKOVsDwOPiw.6SEhFm7AsNuEkmu0ub39Jo0jA.tSKSG', 1, 1),
('manager', 'manager@smartmfg.com', '$2a$10$jykx9QGtAbVKOVsDwOPiw.6SEhFm7AsNuEkmu0ub39Jo0jA.tSKSG', 1, 1),
('operator', 'operator@smartmfg.com', '$2a$10$jykx9QGtAbVKOVsDwOPiw.6SEhFm7AsNuEkmu0ub39Jo0jA.tSKSG', 1, 1);

-- Map User Roles
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1), -- admin -> ROLE_ADMIN
(2, 2), -- engineer -> ROLE_MAINTENANCE_ENGINEER
(3, 3), -- manager -> ROLE_PRODUCTION_MANAGER
(4, 4); -- operator -> ROLE_OPERATOR

-- Seed Machines
INSERT INTO machines (name, serial_number, model, location, status) VALUES
('CNC Milling Machine (CNC-01)', 'SN-CNC-89412', 'VMC-850-Pro', 'Zone A - Precision Machining', 'ACTIVE'),
('Robotic Assembly Arm (ROB-02)', 'SN-ROB-11204', 'KR-210-R3100', 'Zone B - Final Assembly', 'ACTIVE'),
('High-Pressure Steam Boiler (BLR-03)', 'SN-BLR-55678', 'UltraSteam-500', 'Zone D - Utilities & Power', 'ACTIVE'),
('Automated Conveyor Belt (CNV-04)', 'SN-CNV-33421', 'FlexLink-X300', 'Zone B - Sorting & Flow', 'ACTIVE'),
('Industrial Plastic Injector (PLJ-05)', 'SN-PLJ-99012', 'Engel-Duo-550', 'Zone C - Molding Sector', 'ACTIVE');

-- Seed Spare Parts Inventory
INSERT INTO spare_parts (name, part_number, stock_quantity, min_stock_level, cost, location) VALUES
('High-Speed Spindle Bearing', 'PART-BRG-102', 15, 4, 120.00, 'Aisle A - Shelf 3'),
('Hydraulic Sealing Ring (20mm)', 'PART-SLR-404', 3, 10, 15.50, 'Aisle B - Bin 12'),
('Pneumatic Valve Solenoid', 'PART-VAL-309', 22, 5, 45.00, 'Aisle C - Shelf 2'),
('Boiler Pressure Safety Valve', 'PART-SFV-901', 2, 2, 350.00, 'Aisle E - Cabinet 1'),
('Conveyor Drive Belt (Rubber)', 'PART-DBT-882', 10, 3, 65.00, 'Aisle D - Shelf 1'),
('Proximity Sensor M12', 'PART-SEN-501', 8, 5, 28.00, 'Aisle A - Drawer 4');
