import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { addEvent, deleteEvent, updateEvent, listAllEvents } from '../controllers/eventController.js';

const eventRoute = express.Router();

eventRoute.post('/add', verifyToken, addEvent);
eventRoute.delete('/delete', verifyToken, deleteEvent);
eventRoute.put('/update', verifyToken, updateEvent);
eventRoute.get('/list', verifyToken, listAllEvents);
export default eventRoute;
