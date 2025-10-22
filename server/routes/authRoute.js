import express from 'express';
import { loginWithGoogle } from '../controllers/authController.js';

const authRoute = express.Router();

/**
 * POST /api/auth/google
 * Verify Firebase ID token, register user if new, and return a backend JWT.
 * 
 * Request body:
 * {
 *   "idToken": "<Firebase ID token>"
 * }
 * 
 * Response:
 * 200 OK
 * {
 *   "message": "Google login successful",
 *   "token": "<backend JWT>",
 *   "user": { ...user data... }
 * }
 */
authRoute.post('/google', loginWithGoogle);

export default authRoute;