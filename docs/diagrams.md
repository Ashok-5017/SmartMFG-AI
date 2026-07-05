# System Diagrams - Smart Manufacturing Monitoring

This document details the architectural layouts, data schemas, and sequence structures of the system.

---

## 1. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    users ||--o{ user_roles : has
    roles ||--o{ user_roles : has
    machines ||--o{ machine_sensors : records
    machines ||--o{ maintenance_requests : requires
    machines ||--o{ maintenance_history : repairs
    users ||--o{ maintenance_requests : requests_or_assigns
    users ||--o{ maintenance_history : performs
    maintenance_requests ||--o| maintenance_history : completes
    maintenance_history ||--o{ maintenance_spare_parts : consumes
    spare_parts ||--o{ maintenance_spare_parts : consumes
    machines ||--o{ production_logs : produces
    production_logs ||--o| quality_checks : inspects

    users {
        bigint id PK
        varchar username
        varchar email
        varchar password
        boolean enabled
        boolean verified
    }
    roles {
        bigint id PK
        varchar name
    }
    machines {
        bigint id PK
        varchar name
        varchar serial_number
        varchar status
        varchar location
    }
    machine_sensors {
        bigint id PK
        bigint machine_id FK
        double temperature
        double vibration
        double pressure
        timestamp timestamp
    }
    maintenance_requests {
        bigint id PK
        bigint machine_id FK
        bigint requested_by_id FK
        bigint assigned_to_id FK
        varchar priority
        varchar status
    }
    maintenance_history {
        bigint id PK
        bigint machine_id FK
        bigint request_id FK
        bigint performed_by_id FK
        text action_taken
        decimal cost
    }
    spare_parts {
        bigint id PK
        varchar name
        varchar part_number
        int stock_quantity
    }
```

---

## 2. Agent Coordination Sequence Diagram

This sequence illustrates the automatic workflow triggered when the background simulator pushes a thermal/vibration anomaly to the database.

```mermaid
sequenceDiagram
    autonumber
    actor Tech as Maintenance Engineer
    participant Sim as Telemetry Simulator
    participant DB as MySQL DB
    participant Sup as Supervisor Agent
    participant Mon as Monitoring Agent
    participant Pred as Predictive Maint Agent
    participant RCA as RCA Agent
    participant Inv as Inventory Agent
    participant Opt as Production Opt Agent

    Sim->>DB: Post Telemetry [Temp = 92C, Vib = 5.6]
    Note over Sim,DB: Threshold breached: Anomaly flagged!
    DB->>Sup: Push alert to Supervisor
    Sup->>Mon: Invoke: Telemetry anomaly scan
    Mon-->>Sup: Status: [Breach verified, Urgency: CRITICAL]
    Sup->>Pred: Invoke: Remaining Useful Life forecasting
    Pred-->>Sup: Status: [RUL: 140 hrs, Wear: 87%]
    Sup->>RCA: Invoke: Diagnostic & repair procedures
    RCA-->>Sup: Status: [Cause: roller friction, Need: PART-BRG-102]
    Sup->>Inv: Invoke: Inventory stock checks
    Inv-->>Sup: Status: [Part in stock: YES, Qty: 15]
    Sup->>Opt: Invoke: Safe running mitigation advice
    Opt-->>Sup: Status: [Mitigation: reduce RPM 10%, OEE impact: -6%]
    Sup->>DB: Log AI recommendation and send UI notifications
    DB-->>Tech: Display warning alert in dashboard
```

---

## 3. High-Level System Architecture Diagram

```mermaid
graph TD
    subgraph Client Layer
        React[React Vite Frontend]
        Charts[Chart.js Telemetry]
        Copilot[AI Co-Pilot Console]
    end

    subgraph Service Layer
        Spring[Spring Boot Backend]
        Security[Spring Security JWT]
        Sched[Sensor Data Simulator]
        Rag[RAG Service]
    end

    subgraph Autonomous AI Layer
        Supervisor[Supervisor Agent]
        SubAgents[Sub-Agents: Mon, Pred, RCA, Inv, Opt]
        LLM[Gemini API API Client]
        Supervisor --> SubAgents
        SubAgents --> LLM
        Rag --> Qdrant
    end

    subgraph Database Layer
        MySQL[(MySQL Metadata)]
        Redis[(Redis Caching)]
        Qdrant[(Qdrant Vector DB)]
    end

    React -->|REST / JWT| Spring
    Spring --> Security
    Spring --> Sched
    Spring --> Rag
    Spring --> Supervisor
    Spring --> MySQL
    Spring --> Redis
```
