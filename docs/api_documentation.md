# REST API Reference Documentation

This document lists details for the manufacturing REST API endpoints exposed by the Spring Boot server. All endpoints (except Auth) require a bearer token in the `Authorization: Bearer <token>` header.

---

## 1. Authentication Endpoints

### A. Register User
* **Endpoint**: `POST /api/auth/register`
* **Access**: Public
* **Request Body**:
```json
{
  "username": "technician_dave",
  "email": "dave@smartmfg.com",
  "password": "Password123",
  "roles": ["MAINTENANCE_ENGINEER"]
}
```
* **Success Response (200 OK)**:
```json
{
  "message": "User registered successfully!"
}
```

### B. User Login
* **Endpoint**: `POST /api/auth/login`
* **Access**: Public
* **Request Body**:
```json
{
  "usernameOrEmail": "technician_dave",
  "password": "Password123"
}
```
* **Success Response (200 OK)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer"
}
```

---

## 2. Machine Assets Telemetry

### A. Get All Machines
* **Endpoint**: `GET /api/machines`
* **Access**: All Roles
* **Success Response (200 OK)**:
```json
[
  {
    "id": 1,
    "name": "CNC Milling Machine 01",
    "serialNumber": "CNC-2026-X100",
    "status": "OPERATIONAL",
    "location": "Aisle B-4"
  }
]
```

### B. Ingest Sensor Readings
* **Endpoint**: `POST /api/machines/telemetry`
* **Access**: Automated simulator or registered Operators
* **Request Body**:
```json
{
  "machineId": 1,
  "temperature": 94.2,
  "pressure": 15.1,
  "vibration": 5.7,
  "humidity": 42.0,
  "voltage": 415.0,
  "current": 18.2,
  "rpm": 2200.0,
  "runningHours": 1850.5
}
```
* **Success Response (200 OK)**:
```json
{
  "id": 105,
  "machineId": 1,
  "temperature": 94.2,
  "vibration": 5.7,
  "pressure": 15.1,
  "timestamp": "2026-07-04T18:32:00"
}
```

---

## 3. Autonomous AI Diagnosis

### A. Submit Diagnosis Prompt
* **Endpoint**: `POST /api/ai/diagnose`
* **Access**: Admin, Manager, Supervisor
* **Request Body**:
```json
{
  "machineId": 1,
  "prompt": "Inspect CNC-01 milling machine telemetry for wear."
}
```
* **Success Response (200 OK)**:
```json
{
  "machineId": 1,
  "timestamp": "2026-07-04T18:32:10",
  "anomalyDetected": true,
  "anomalyDetails": "High bearing friction detected.",
  "recommendedAction": "Lubricate bearings or replace part BRG-102.",
  "requiredParts": ["BRG-102"],
  "rulForecastHours": 140.0,
  "mitigationAdvice": "Reduce speed by 10% until serviced."
}
```

### B. Get AI Execution Logs
* **Endpoint**: `GET /api/ai/logs`
* **Access**: Admin, Manager
* **Success Response (200 OK)**:
```json
[
  {
    "id": 201,
    "agentName": "SUPERVISOR",
    "prompt": "Run full anomaly diagnostics scan.",
    "response": "{...}",
    "executionTimeMs": 1824,
    "timestamp": "2026-07-04T18:32:10"
  }
]
```
