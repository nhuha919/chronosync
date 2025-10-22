import express from 'express';
import { loginWithGoogle } from '../controllers/authController.js';

const authRoute = express.Router();

// POST /api/auth/google
authRoute.post('/google', loginWithGoogle);

export default authRoute;