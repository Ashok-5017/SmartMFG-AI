# Production Deployment Guide

This guide details instructions for packaging, serving, and maintaining the Smart Manufacturing Monitoring application in production-grade containerized environments.

---

## 1. Containerized Infrastructure (Docker Compose)

Production deployment utilizes the orchestrator definitions in `docker/docker-compose.yml` to set up isolated, linked service containers.

### Multi-Container Topology
* **Database Layer**: MySQL 8.0 containing telemetry and role metadata.
* **Vector Store Layer**: Qdrant running over gRPC (port `6334`) for indexing semantic logs.
* **Caching Layer**: Redis mapping volatile real-time metrics.
* **Logic Layer**: Spring Boot 3 running JVM 21, connected via internal network aliases.
* **Serving Layer**: Nginx serving the compiled React static bundle and reverse-proxying API calls to the Java backend.

---

## 2. Server Packaging Configurations

### A. Backend Dockerfile (`backend/Dockerfile`)
The backend uses a multi-stage Docker build to keep images thin:
```dockerfile
# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Serve
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/monitor-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### B. Frontend Dockerfile (`frontend/Dockerfile`)
The frontend compiles JS assets and copies them into an Alpine Nginx image:
```dockerfile
# Stage 1: Build
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 3. Production Hardening Checklist

### A. SSL/TLS Termination
Always configure SSL/TLS via a reverse proxy (e.g., Nginx, Traefik, or AWS ALB). Do not expose port 8080 or port 80 directly to the internet.
Nginx SSL Configuration snippet:
```nginx
server {
    listen 443 ssl;
    server_name smartmfg.company.internal;

    ssl_certificate /etc/ssl/certs/smartmfg.crt;
    ssl_certificate_key /etc/ssl/private/smartmfg.key;

    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend-service:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### B. Database Backups
Ensure persistent volume mounts are configured for MySQL (`/var/lib/mysql`) and Qdrant (`/qdrant/storage`). Set up cron jobs to run `mysqldump` backups daily:
```bash
mysqldump -u root -pPassword123 smart_mfg > backup_$(date +%F).sql
```
