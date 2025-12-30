# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/57160c0a-8215-4f2b-bb90-ed6fb233e7f7

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/57160c0a-8215-4f2b-bb90-ed6fb233e7f7) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Running the full project locally (frontend + backend)

This repository has a Vite + React frontend and an Express backend located in the `backend/` folder. The frontend currently uses mock data by default; follow the steps below to run both servers and prepare environment variables when you are ready to integrate the real backend.

Prerequisites
- Node.js (LTS) and npm installed
- Optional: MongoDB running locally or a MongoDB Atlas connection string

1) Install frontend dependencies and start Vite (from project root):

```powershell
cd 'C:\Users\KIRAN YADAV\OneDrive\Desktop\VsCodeFile\IntervuIq'
npm install
npm run dev
```

2) Install backend dependencies and start server (in a new terminal):

```powershell
cd 'C:\Users\KIRAN YADAV\OneDrive\Desktop\VsCodeFile\IntervuIq\backend'
npm install

# Copy the example env file and update values (do NOT commit your .env)
copy .env.example .env

# Example: set temporary env vars in the current PowerShell session and start the server
$env:MONGO_URI = 'mongodb://127.0.0.1:27017/intervuiq_dev'
$env:JWT_SECRET = 'changeme'
$env:CLIENT_ORIGIN = 'http://localhost:5173'
node server.js
```

Notes
- The backend's example env file is at `backend/.env.example` and lists `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`, `PORT`, and `NODE_ENV`.
- By default, the frontend uses mock data in `src/data/dummyData.ts`. After the backend is implemented, we'll add an Axios client and wire API calls.
- For secure sessions, the backend will set HttpOnly cookies (recommended). If you prefer token-in-JS (Authorization header), the frontend will set the token on login.

If you'd like, I can create `.env.example` (done) and update the project to use a real backend next (Auth, Interviews CRUD). Tell me which step to start with.


**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/57160c0a-8215-4f2b-bb90-ed6fb233e7f7) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
