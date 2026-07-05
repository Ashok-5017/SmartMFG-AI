# AI Smart Manufacturing Monitoring & Autonomous Maintenance System

An enterprise-grade manufacturing monitoring, anomaly detection, predictive maintenance, and RAG-integrated autonomous agent orchestration system.

---

## Technical Stack

* **Frontend**: React.js (Vite), React Router, Tailwind CSS, Axios, Chart.js.
* **Backend**: Java 21, Spring Boot 3, Spring Security (JWT), Spring Data JPA.
* **Databases**: MySQL 8.0, Qdrant Vector Database, Redis Cache.
* **AI Orchestration**: Google Gemini models (Gemini-1.5-flash / Gemini-1.5-pro) coordinated via a Supervisor Agent pattern.
* **DevOps**: Docker, Docker Compose, Nginx.

---

## Directory Layout

```
AI_MANUFATURISATION/
├── backend/                  # Java Spring Boot 3 Backend
│   ├── src/                  # Main Java and resources source
│   ├── Dockerfile            # Multi-stage maven build
│   └── pom.xml               # Dependencies configurations
├── frontend/                 # React SPA Frontend
│   ├── src/                  # React components and context source
│   │   ├── components/       # Layouts, Sidebar, Navbar
│   │   ├── context/          # JWT Session Auth Context
│   │   ├── pages/            # Dashboard, Machines, AI Co-Pilot, Spares
│   │   └── utils/            # Axios API wrappers
│   ├── index.html            # Entry layout
│   ├── vite.config.js        # Vite port configurations
│   ├── tailwind.config.js    # Custom neons colors themes
│   └── Dockerfile            # Node build + Nginx Alpine serve
├── docker/                   # Deployment Orchestration
│   ├── mysql/
│   │   └── init.sql          # DB Schema & Seed entries
│   └── docker-compose.yml    # Container linkages
└── docs/                     # Documentation & Diagrams
    ├── diagrams.md           # System UML Diagrams (Mermaid)
    └── testing.md            # Testing logs & API collections
```

---

## Quick Start (Local Run)

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
* A Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/) (Optional: System runs mock fallback models out-of-the-box if no API Key is provided).

### Execution Commands

1. **Clone/Open Workspace**: Navigate to the `docker/` folder:
   ```powershell
   cd docker
   ```

2. **Configure Environment**: Set your Gemini API Key in the current shell context:
   * **Windows PowerShell**:
     ```powershell
     $env:GEMINI_API_KEY="AIzaSyYourGeminiKeyHere"
     ```
   * **Windows CMD / Git Bash / Linux**:
     ```bash
     export GEMINI_API_KEY="AIzaSyYourGeminiKeyHere"
     ```

3. **Orchestrate Stack**: Fire up all containerized services:
     ```bash
     docker-compose up --build
     ```

4. **Verify Live Panels**:
   * **React Web Console**: [http://localhost:80](http://localhost:80)
   * **REST APIs Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
   * **Qdrant DB Management Console**: [http://localhost:6333/dashboard](http://localhost:6333/dashboard)

---

## Default User Accounts

Use any of the following accounts to log in (Password for all is: `Password123`):

* **System Admin**:
  * Username: `admin` (or email: `admin@smartmfg.com`)
* **Maintenance Engineer**:
  * Username: `engineer` (or email: `engineer@smartmfg.com`)
* **Production Manager**:
  * Username: `manager` (or email: `manager@smartmfg.com`)
* **Sector Operator**:
  * Username: `operator` (or email: `operator@smartmfg.com`)
