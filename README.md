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
- [x] JWT Authentication
- [x] Income & Expense CRUD
- [x] Dashboard & Charts
- [x] Budget module
- [x] Reports (PDF/Excel export)
- [x] Deployment (Vercel Live Demo configured)

🌐 Live Demo & Deployment to Vercel

### Option 1: Deploy with Vercel Dashboard (Recommended)

1. Push your changes to your GitHub repository:
   ```bash
   git add .
   git commit -m "Configure Vercel live demo"
   git push origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new) and import your `spendix` repository.
3. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend` (or leave as `./` — root `vercel.json` will handle it automatically)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**! 🚀
5. Once deployed, open your live link. Click **"⚡ Instant Live Demo (Guest Access)"** to immediately preview all features, charts, and budget tools with pre-loaded demo data!

### Connecting a Live Backend (Optional)

If you host your Spring Boot backend on [Render](https://render.com), [Railway](https://railway.app), or [Koyeb](https://www.koyeb.com):
1. In your Vercel project dashboard, go to **Settings > Environment Variables**.
2. Add:
   - `VITE_API_URL` = `https://your-backend-api.onrender.com/api`
3. Redeploy the application.


📄 License

This project is for educational/portfolio purposes.

👤 Author

Built by [Hiranya]
