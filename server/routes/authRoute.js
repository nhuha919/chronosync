import express from 'express';
import { loginWithGoogle } from '../controllers/authController.js';

const authRoute = express.Router();

authRoute.post('/google', loginWithGoogle);

export default authRoute;