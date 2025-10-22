import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoute from './routes/authRoute.js';
import parseRoute from './routes/parseRoute.js';
import eventRoute from './routes/eventRoute.js';
import googleCalendarRoute from './routes/googleCalendarRoute.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ type: ['application/json', 'text/plain'] }));

app.use('/api/auth', authRoute);
app.use('/api/parse', parseRoute);
app.use('/api/events', eventRoute);
app.use("/google", googleCalendarRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
