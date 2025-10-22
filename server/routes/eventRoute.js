import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { addEvent } from '../controllers/eventController.js';

const eventRoute = express.Router();

/**
 * POST /api/events/add
 * Create a new Google Calendar event and store it in the database.
 * 
 * Request body:
 * {
 *   "title": "Meeting with team",
 *   "start_time": "2025-10-23T15:00:00Z",
 *   "end_time": "2025-10-23T16:00:00Z",
 *   "accessToken": "<Google OAuth access token>"
 * }
 * 
 * Header:
 * Authorization: Bearer <JWT>
 * 
 * Response:
 * 201 Created
 * {
 *   "message": "Event created",
 *   "event": { ...event data... }
 * }
 */
eventRoute.post('/add', verifyToken, addEvent);
export default eventRoute;
