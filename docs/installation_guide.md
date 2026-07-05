# Installation & Setup Guide

This guide details the step-by-step instructions to configure and run the Smart Manufacturing Monitoring application locally or in staging environments.

---

## 1. System Requirements

* **Operating System**: Windows 10/11, macOS, or Linux.
* **JDK**: Eclipse Temurin OpenJDK 21 or 25.
* **Node.js**: v20 or newer (comes with `npm`).
* **Databases**:
  * MySQL 8.0+
  * Redis (for telemetry cache)
  * Qdrant (for vector search)

---

## 2. Infrastructure Setup

### A. MySQL Database
1. Connect to your local or remote MySQL instance as administrator:
   ```bash
   mysql -u root -p
   ```
2. Execute the schema initialization script located at `docker/mysql/init.sql`:
   ```sql
   CREATE DATABASE IF NOT EXISTS smart_mfg;
   USE smart_mfg;
   SOURCE c:/Users/ashok/OneDrive/Desktop/AI_MANUFATURISATION/docker/mysql/init.sql;
   ```

### B. Redis Server
* **Linux/macOS**:
  ```bash
  brew install redis
  brew services start redis
  ```
* **Windows**: Run Redis using Docker or install [Redis-x64 for Windows](https://github.com/tporadowski/redis/releases). Ensure the service is running on default port `6379`.

### C. Qdrant Vector Database
1. Launch Qdrant using Docker:
   ```bash
   docker run -p 6333:6333 -p 6334:6334 -v qdrant_storage:/qdrant/storage qdrant/qdrant
   ```
2. Open the console at `http://localhost:6333/dashboard` to verify it is running.

---

## 3. Configuration Setup

### A. Backend (`backend/src/main/resources/application.yml`)
Configure connection settings for MySQL, Redis, Qdrant, and third-party services:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/smart_mfg?useSSL=false&allowPublicKeyRetrieval=true
    username: root
    password: Password123
  data:
    redis:
      host: localhost
      port: 6379

qdrant:
  host: localhost
  port: 6334

cloudinary:
  cloud-name: your-cloud-name
  api-key: your-api-key
  api-secret: your-api-secret

google:
  gemini:
    api-key: AIzaSyYourGeminiApiKeyHere
```

### B. Frontend (`frontend/.env`)
Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:8080/api
```

---

## 4. Launching the Servers

### A. Start Spring Boot Backend
1. Navigate to the `backend/` folder:
   ```bash
   cd backend
   ```
2. Compile and package the Java binary:
   ```bash
   ..\maven\apache-maven-3.9.6\bin\mvn.cmd clean package -DskipTests
   ```
3. Run the application:
   ```bash
   java -jar target/monitor-1.0.0.jar
   ```

### B. Start React Frontend
1. Navigate to the `frontend/` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the development server:
   ```bash
   npm run dev
   ```
4. Access the web interface at: `http://localhost:5173`
