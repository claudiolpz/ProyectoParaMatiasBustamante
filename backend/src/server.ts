import express from 'express';
import router from './router';
const app = express();
import 'dotenv/config'

app.use(express.json())
app.use('/api',router)

export default app;