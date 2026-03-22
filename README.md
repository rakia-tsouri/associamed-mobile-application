# Application Mobile - Suivi des Salles (Associa-Med)

An end-to-end room tracking and management solution built for Associa-Med. This project includes a Flutter mobile application, a NestJS backend REST API, and a web-based Admin Dashboard. 

## 🏗 System Architecture

This project is divided into three main components:

1. **Backend API (`/src`)**: A robust REST API built with **NestJS**. It handles authentication (JWT), database operations via TypeORM, and business logic for users, roles, and rooms tracking.
2. **Mobile Application (`/frontend`)**: A cross-platform mobile app built with **Flutter**. It provides distinct interfaces and features based on the logged-in user's role (Admin, User 1, User 2).
3. **Admin Dashboard (`/admin-dashboard`)**: A web interface for administrators to perform CRUD operations on users, monitor room metrics, and manage the system.

---

## ✨ Features

- **Role-Based Access Control**:
  - **Admin**: Full control over users (CRUD) and rooms.
  - **User 1 / User 2**: Specialized dashboard details, room assignment views, and optimized room cards.
- **Room Tracking**: Monitor room availability and metrics.
- **Associa-Med Branding**: Dynamic and modern UI tailored for the Associa-Med organization.
- **Containerized Environment**: The backend, database, and admin dashboard are fully Dockerized for a seamless development and deployment experience.

---

## 💻 Technologies Used

### Backend
- **Framework**: NestJS (TypeScript)
- **Database**: MySQL 8.0
- **ORM**: TypeORM
- **Authentication**: Passport-JWT & bcrypt

### Mobile Frontend
- **Framework**: Flutter (Dart)
- **State Management**: Provider
- **Storage**: `shared_preferences`
- **Networking**: `http` package

### Admin Dashboard / Infrastructure
- **Server**: Nginx (Alpine)
- **Containerization**: Docker & Docker Compose

---

## 🚀 Getting Started

### Prerequisites
- [Docker & Docker Compose](https://www.docker.com/) (For backend & dashboard)
- [Flutter SDK](https://flutter.dev/docs/get-started/install) (For mobile app)
- [Node.js](https://nodejs.org/en/) (Optional: for running the backend locally without Docker)

### 1. Docker Setup (Backend, Database, Admin Dashboard)

The easiest way to run the backend and dashboard is via Docker. A `docker-compose.yml` file is included at the root of the project.

```bash
# Start all services in the background
docker-compose up -d
```

**Services running via Docker:**
- **MySQL Database**: Exposed on Host port `3307`
- **NestJS Backend**: Exposed on Host port `3000` (Swagger docs available at `http://localhost:3000/api/docs`)
- **Admin Dashboard**: Exposed on Host port `8081` (Accessible at `http://localhost:8081`)

*Note: If you need to stop the containers, run `docker-compose down`.*

### 2. Running the Flutter Mobile App

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Fetch the required dependencies:
   ```bash
   flutter pub get
   ```
3. Run the application on your connected device or emulator:
   ```bash
   flutter run
   ```

*(Ensure the mobile app's API base URL points to your local machine's IP address if running on a physical device, e.g., `http://192.168.x.x:3000`)*

---

## 🛠 Local Development (Without Docker)

If you prefer to run the NestJS backend manually:

1. Ensure a MySQL instance is running and update the `.env` file credentials.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the backend:
   ```bash
   # Development watch mode
   npm run start:dev
   ```

## 📄 License
This project is proprietary and built for Associa-Med.
