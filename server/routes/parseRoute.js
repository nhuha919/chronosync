import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { parseTask } from '../controllers/parseController.js';

const parseRoute = express.Router();
/**
 * POST /api/parse
 * Parse user input text using OpenAI to extract structured task information.
 * 
 * Request body:
 * {
 *   "text": "Schedule a meeting tomorrow at 3pm"
 * }
 * 
 * Header:
 * Authorization: Bearer <JWT>
 * 
 * Response:
 * 200 OK
 * {
 *   "parsed": {
 *     "intent": "schedule_event",
 *     "title": "Meeting",
 *     "date": "2025-10-23",
 *     "start_time": "2025-10-23T15:00:00Z",
 *     "end_time": "2025-10-23T16:00:00Z"
 *   }
 * }
 * 
 * Notes:
 * - Automatically adds one hour to end_time if it is missing but start_time is provided.
 * - Logs both user input and parsed response in the messages table.
 */
parseRoute.post('/', verifyToken, parseTask);
export default parseRoute;