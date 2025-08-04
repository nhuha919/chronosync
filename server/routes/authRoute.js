import express from 'express';
import { register, login, googleLogin } from '../controllers/authController';
import { auth } from '../firebaseAdmin';

const authRoute = express.Router();

authRoute.post('/register', register);
authRoute.post('/login', login);
authRoute.post('/google-login', googleLogin);

export default authRoute;