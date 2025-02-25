# FastAPI + Next.js + PostgreSQL Project

This project uses **FastAPI** for the backend, **Next.js** for the frontend, and **PostgreSQL** as the database.  
Administrators can add people to the database, and users can search for them through the web application.

---

## 📌 Getting Started

### **1. Requirements**
Before running the project, make sure you have the following installed:

- **Docker** and **Docker Compose**
- **Python 3.9+**
- **Node.js** and **npm** (for the frontend)

If you need to install the required Python dependencies, run:

```bash
pip install -r requirements.txt

To start all services, run:

docker compose up -d

3. Backend and Frontend URLs
Once the project is running:

Backend (FastAPI) API documentation:

Swagger UI: http://localhost:8000/docs
ReDoc: http://localhost:8000/redoc
Frontend (Next.js Web Application):

http://localhost:3000

docker exec -it postgres_cont psql -U user -d persons

docker compose down
