import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { addEvent } from '../controllers/eventController.js';

const eventRoute = express.Router();
eventRoute.post('/add', verifyToken, addEvent);
export default eventRoute;
