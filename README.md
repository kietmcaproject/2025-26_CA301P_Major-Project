# E-Complaint Redressal System

A full-stack web application for managing student complaints in educational institutions.

## 📋 Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (local or MongoDB Atlas) - [Download](https://www.mongodb.com/try/download/community) or [Atlas](https://mongodb.com/atlas)
- **Git** - [Download](https://git-scm.com/)

## 🚀 Quick Setup

### Step 1: Install Dependencies

Open **two terminals** - one for backend and one for frontend.

**Terminal 1 - Backend:**
```bash
cd ecomplain-backend
npm install
```

**Terminal 2 - Frontend:**
```bash
cd ecomplain-frontend
npm install
```

### Step 2: Configure Environment Variables

#### Backend Configuration

1. Navigate to `ecomplain-backend` folder
2. Copy the example environment file:
   ```bash
   copy .env.example .env
   ```
3. Open `.env` and fill in your values:

| Variable | Description | How to Get |
|----------|-------------|------------|
| `MONGODB_URI` | MongoDB connection string | Use local MongoDB or create free [MongoDB Atlas](https://mongodb.com/atlas) account |
| `JWT_SECRET` | Secret key for tokens | Any random string (e.g., "mySecretKey123") |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | Any random string (different from above) |
| `CLOUDINARY_*` | Image upload service | Create free account at [Cloudinary](https://cloudinary.com) |
| `EMAIL_FROM` | Email sender address | Your email address |

> **Note:** For testing, you can use MongoDB locally with: `mongodb://localhost:27017/ecomplain`

#### Frontend Configuration

1. Navigate to `ecomplain-frontend` folder
2. Copy the example environment file:
   ```bash
   copy .env.example .env
   ```
3. The default `.env` should already have:
   ```
   VITE_API_URL=http://localhost:4000
   ```

### Step 3: Run the Application

**Terminal 1 - Start Backend (Port 4000):**
```bash
cd ecomplain-backend
npm run dev
```

**Terminal 2 - Start Frontend (Port 5173):**
```bash
cd ecomplain-frontend
npm run dev
```

### Step 4: Open in Browser

Visit: **http://localhost:5173**

## 📁 Project Structure

```
E-Complaint-Redressal/
├── ecomplain-backend/     # Node.js + Express API
│   ├── src/
│   ├── server.js
│   └── .env.example
├── ecomplain-frontend/    # React + Vite Frontend  
│   ├── src/
│   └── .env.example
└── README.md
```

## 🔧 Troubleshooting

### "MongoDB connection failed"
- Make sure MongoDB is running locally, or
- Check your MongoDB Atlas connection string is correct
- Ensure your IP is whitelisted in MongoDB Atlas

### "CORS error" in browser
- Make sure backend is running on port 4000
- Check `ALLOWED_ORIGINS` in backend `.env` includes `http://localhost:5173`

### "npm install" fails
- Try deleting `node_modules` folder and `package-lock.json`, then run `npm install` again
- Make sure you have Node.js v16 or higher: `node --version`

## 👥 Team

- Abhijeet Singh
- Abhishek Mishra

## 📄 License

MIT License
