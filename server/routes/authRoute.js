import express from 'express';
import { loginWithGoogle } from '../controllers/authController';

const authRoute = express.Router();

// POST /api/auth/google
authRoute.post('/google', loginWithGoogle);

export default authRoute;