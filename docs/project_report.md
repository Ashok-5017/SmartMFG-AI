# Enterprise Architectural Whitepaper & Project Report

## Abstract
Modern manufacturing systems generate high-frequency telemetry. Standard threshold alerts lead to alert fatigue and fail to identify root causes. This project introduces a production-ready, autonomous multi-agent AI system coordinating anomaly detection, Predictive Maintenance (RUL forecasting), Root Cause Analysis (RCA), and parts scheduling.

---

## 1. Architectural Patterns & Choices

We select a **Supervisor-Agent Pattern** utilizing LangChain4j and Google Gemini APIs:

```
        [User Trigger / Alert Stream]
                     │
                     ▼
             [Supervisor Agent]
             /       │        \
            /        │         \
           ▼         ▼          ▼
   [Monitoring]   [RCA]    [Inventory] ...
```

* **Supervisor Agent**: Parses telemetry, creates processing graphs, sequences specialized sub-agents, and compiles structured JSON reports.
* **Monitoring Agent**: Detects multivariable anomalies.
* **Predictive Maintenance Agent**: Estimates RUL (Remaining Useful Life) using wear models.
* **RCA Agent**: Searches manual documentation via RAG to suggest step-by-step repairs.
* **Inventory Agent**: Verifies and books replacement components.
* **Production Optimization Agent**: Advises on mitigation settings to minimize OEE drops.

---

## 2. Infrastructure Technologies

* **MySQL**: Serves as the system of record for relational metadata, tracking equipment states, users, and audit logs.
* **Redis**: Acts as an in-memory cache, keeping the latest telemetry frames active to prevent MySQL from being bottle-necked by sensor writes.
* **Qdrant**: Manages vector embeds of equipment troubleshooting guides, facilitating sub-second RAG lookups during failure diagnoses.

---

## 3. Security & Access Model

Authorization is modeled around State-less JSON Web Tokens (JWT) mapped to role configurations:
* `ROLE_ADMIN`: Decommissions hardware assets, manages employee logins, and edits warehouse stock levels.
* `ROLE_PRODUCTION_MANAGER`: Views factory efficiency metrics, runs batch AI reports, and assigns work tickets.
* `ROLE_MAINTENANCE_ENGINEER`: Receives alert boards, logs work ticket completion, and issues spare parts.
* `ROLE_OPERATOR`: Submits manual breakdown tickets and registers raw telemetry.

---

## 4. Future Roadmap

1. **Vibration Spectrum Analysis**: Support high-frequency vibration waveforms utilizing Fast Fourier Transforms (FFT) before AI inference.
2. **Federated Edge Learning**: Deploy compressed ONNX models directly on factory floor PLC microcontrollers for sub-millisecond offline anomaly detection.
3. **Automated Ticket Dispatch**: Fully integrate SMS and pager channels to alert on-duty technicians immediately on anomaly validation.
