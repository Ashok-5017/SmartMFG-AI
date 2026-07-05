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

---

## 4. Cloud PaaS Deployment (Vercel, Railway, & Render)

For rapid, cost-efficient cloud hosting, follow these steps to link your GitHub repository to Vercel and Railway.

### A. Database Provisioning (Railway MySQL)
1. Go to [Railway.app](https://railway.app/) and create a new project.
2. Click **+ Add Service** and select **MySQL Database**.
3. Railway will provision a MySQL instance. Under the **Variables** tab of the MySQL service, copy the values for:
   * `MYSQLHOST`
   * `MYSQLPORT`
   * `MYSQLPASSWORD`
   * `MYSQLUSER`
   * `MYSQLDATABASE`

### B. Backend Deployment (Railway)
1. Click **+ Add Service** in your Railway dashboard and select **GitHub Repo**.
2. Select your `SmartMFG-AI` repository.
3. In the service settings, set the **Root Directory** to `/backend`.
4. Go to the **Variables** tab and add the following Environment Variables:
   * `SPRING_DATASOURCE_URL` = `jdbc:mysql://${{MYSQLHOST}}:${{MYSQLPORT}}/${{MYSQLDATABASE}}?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true`
   * `SPRING_DATASOURCE_USERNAME` = `${{MYSQLUSER}}`
   * `SPRING_DATASOURCE_PASSWORD` = `${{MYSQLPASSWORD}}`
   * `SPRING_JPA_HIBERNATE_DDL_AUTO` = `update`
5. Railway will automatically pick up the Java Maven setup, compile it, and deploy the service. Copy the generated public domain URL (e.g. `https://smartmfg-backend.up.railway.app`).

### C. Frontend Deployment (Vercel)
1. Go to [Vercel.com](https://vercel.com/) and create a new project.
2. Import the `SmartMFG-AI` repository.
3. In the configuration settings, set the **Framework Preset** to **Vite**.
4. Set the **Root Directory** to `frontend`.
5. Under **Environment Variables**, add:
   * `VITE_API_BASE_URL` = `https://<your-railway-backend-url>.up.railway.app` (using the URL copied in the previous step).
6. Click **Deploy**. Vercel will compile the Vite assets and serve the static files over a secure HTTPS endpoint.
