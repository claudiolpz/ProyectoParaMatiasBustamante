import express from 'express';
import cors from 'cors';
import router from './router';
import { corsConfig } from './config/cors';

const app = express();
import 'dotenv/config'

//Cors
app.use(cors(corsConfig));

app.use(express.static('public'))
//Leer datos de fomularios
app.use(express.json())


app.use('/api',router)

export default app;