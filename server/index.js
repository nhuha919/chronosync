import express from 'express';
import authRoute from './routes/authRoute';

const app = express();
app.use(express.json()); // Required for JSON body parsing

app.use('/api/auth', authRoute);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));