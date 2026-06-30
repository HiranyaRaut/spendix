Spendix 💰

A full-stack personal expense management application built with React, Spring Boot, MySQL, and JWT Authentication.

🚀 Tech Stack

**Frontend:** React (Vite), Tailwind CSS, React Router, Axios, Chart.js
**Backend:** Java 21, Spring Boot 3.5.1, Spring Security, Spring Data JPA
**Database:** MySQL
**Auth:** JWT (JSON Web Tokens)
**Build Tool:** Maven

✨ Features

- 🔐 User registration, login & JWT-secured authentication
- 📊 Dashboard with income/expense/balance overview + charts
- 💵 Income & Expense tracking (CRUD)
- 🧾 Transaction history with search, filter & pagination
- 📅 Monthly & category-wise budgeting with alerts
- 📑 PDF & Excel report exports
- 👤 Profile management

> Full feature breakdown in [`docs/SRS.md`](docs/SRS.md)

📁 Project Structure
spendix/
├── backend/     # Spring Boot REST API
├── frontend/    # React + Vite client
└── docs/        # SRS, API docs, DB schema

⚙️ Getting Started

Prerequisites

- Java 21
- Node.js 20+
- MySQL 8+
- Maven 3.9+

Backend Setup

\`\`\`bash
cd backend
# Create MySQL database (see docs/schema.sql)
# Configure src/main/resources/application.properties with your DB credentials
./mvnw spring-boot:run
\`\`\`

Backend runs on `http://localhost:8080`

### Frontend Setup

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

Frontend runs on `http://localhost:5173`

🗄️ Database Setup

\`\`\`sql
CREATE DATABASE spendix_db;
CREATE USER 'spendix_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON spendix_db.* TO 'spendix_user'@'localhost';
FLUSH PRIVILEGES;
\`\`\`

📖 Documentation

- [API Documentation](docs/API.md)
- [Database Schema](docs/schema.sql)
- [SRS Document](docs/SRS.md)

 🗺️ Roadmap

- [x] Project setup & database config
- [ ] JWT Authentication
- [ ] Income & Expense CRUD
- [ ] Dashboard & Charts
- [ ] Budget module
- [ ] Reports (PDF/Excel export)
- [ ] Deployment

📄 License

This project is for educational/portfolio purposes.

👤 Author

Built by [Hiranya]
