# Testing Documentation & Postman API Collection

This document describes how to execute automated tests and lists API payload schemas to import directly into Postman.

---

## 1. Spring Boot Automated Testing

Our backend includes JUnit and Mockito test classes to verify security, database transactions, and agent client mappings.

### Running Automated Tests
To run unit and integration tests from your workspace terminal, navigate to the `backend/` directory and execute:
```bash
mvn test
```

### Core Tests Overview
* **`AuthControllerTest`**: Mocks the authentication manager to verify correct JWT generation upon login and access rejection for invalid credentials.
* **`SensorDataServiceTest`**: Mocks the notification service to verify that recording anomalous parameters triggers appropriate database logs and notifications.
* **`SupervisorAgentTest`**: Mocks individual sub-agents and verification layers to assert that sequential agent orchestration returns clean recommendations.

---

## 2. Postman Collection Payloads

Import these endpoints into Postman to test authentication and operational workflows manually.

### A. Authentication

#### 1. Register User
* **Method**: `POST`
* **URL**: `http://localhost:8080/api/auth/register`
* **Headers**: `Content-Type: application/json`
* **Body**:
```json
{
  "username": "technician_dave",
  "email": "dave@smartmfg.com",
  "password": "Password123",
  "roles": ["MAINTENANCE_ENGINEER"]
}
```

#### 2. Log In
* **Method**: `POST`
* **URL**: `http://localhost:8080/api/auth/login`
* **Headers**: `Content-Type: application/json`
* **Body**:
```json
{
  "usernameOrEmail": "technician_dave",
  "password": "Password123"
}
```

---

### B. Machine & Sensors Management

#### 1. Ingest Sensor Readings
* **Method**: `POST`
* **URL**: `http://localhost:8080/api/machines/telemetry`
* **Headers**: 
  * `Content-Type: application/json`
  * `Authorization: Bearer <JWT_ACCESS_TOKEN>`
* **Body**:
```json
{
  "machineId": 1,
  "temperature": 94.2,
  "pressure": 14.8,
  "vibration": 5.8,
  "humidity": 42.0,
  "voltage": 415.0,
  "current": 18.2,
  "rpm": 2200.0,
  "runningHours": 1850.5
}
```

#### 2. Get Telemetry for Charts
* **Method**: `GET`
* **URL**: `http://localhost:8080/api/machines/1/telemetry?limit=20`
* **Headers**:
  * `Authorization: Bearer <JWT_ACCESS_TOKEN>`

---

### C. AI Agent Diagnosis

#### 1. Trigger Supervisor Diagnostics Scan
* **Method**: `POST`
* **URL**: `http://localhost:8080/api/ai/diagnose`
* **Headers**:
  * `Content-Type: application/json`
  * `Authorization: Bearer <JWT_ACCESS_TOKEN>`
* **Body**:
```json
{
  "prompt": "Inspect CNC Milling Machine (CNC-01) for anomalies and recommend actions.",
  "machineId": 1
}
```

#### 2. Fetch AI Log Audits
* **Method**: `GET`
* **URL**: `http://localhost:8080/api/ai/logs`
* **Headers**:
  * `Authorization: Bearer <JWT_ACCESS_TOKEN>`
