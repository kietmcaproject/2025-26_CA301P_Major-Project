const express = require("express");
const { connectToDb } = require('./connectionwithmongodb');
const cors = require('cors');
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const ConnectionString = process.env.CONNECTIONSTRINGTODB
const DataBaseName = 'hellofellowcoders'
connectToDb(`${ConnectionString}/${DataBaseName}`) // connection String is here
const originforcors = process.env.ORIGIN

const userRouter = require('./router/hellowfellowcoderregisterrouter');

const app = express();
app.use(cors(
    {
        origin: `${originforcors}`,  // Allow only your frontend URL
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],  // If needed, add any specific headers
    }
));
app.use(express.json());
app.use('/api/users', userRouter);

app.get('/', (req, resp) => {
    resp.send(
        `
        <div style='display:flex;justify-content:center; align-items: center;background-color:black;padding:1%;'>
            <h1 style='color:white; font-family: "Times New Roman", Times, serif;text-transform: capitalize;font-weight: 400;'>
                HelloFellowCoders Server Is Working Server Build By Vikas Singh
            </h1>
            <img src='https://hellofellowcoders.netlify.app/assets/hellologo-DuacE69p.png' style='width:250px' alt='imagelog'>
        </div>
        <a href='https://myportfoliobyvikassingh.netlify.app' style='font-weight:400px;font-family: "Times New Roman", Times, serif; text-decoration:none;color:white;display: flex;justify-content: center;margin: 10px 0px; background-color:blue; padding:1%;border-radius:8px;' title='MY-PORTFOLIO WEBSITE'>Click me 💕</a>
        `
    );
})


//server listen in the PORT
app.listen(PORT, () => {
    try {
        console.log(`Server is started on the port number ${PORT} Welcome HelloFellowCoder's Developer : Vikas Singh`);
    } catch (error) {
        console.error(error);
    }
})