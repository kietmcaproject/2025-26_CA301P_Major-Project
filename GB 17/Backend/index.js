const mongoConnection = require('./connection')
const express = require('express')
const app = express()
const PORT = 8000
const authRoutes = require('./routes/authroutes')
const dotenv = require('dotenv').config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
console.log("🔑 Gemini Key Loaded:", !!GEMINI_API_KEY); // should print true
const cookieParser = require('cookie-parser');
app.use(express.json()); 
app.use(cookieParser())
// const cors = require('cors');
const codeRoutes = require('./routes/code')
require('dotenv').config();
const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
const profileRoutes = require('./routes/profileroutes')

// const authRoutes = require('./routes/authroutes');
// const codeRoutes = require('./routes/code');
// const profileRoutes = require('./routes/profileroutes');
// const geminiRoutes = require('./routes/geminiRoute');


// Middlewares
const geminiRoutes = require('./routes/geminiRoute');
app.use('/gemini', geminiRoutes);

// maped routes
app.use('/auth',authRoutes);
app.use('/code',codeRoutes);
app.use('/api',profileRoutes)
app.use('/gemini', geminiRoutes);

mongoConnection();
app.listen(PORT,()=>{
    console.log(`Server is running at ${PORT}`);
})