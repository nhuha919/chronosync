import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { parseTask } from '../controllers/parseController.js';

const parseRoute = express.Router();

parseRoute.post('/', verifyToken, parseTask);
export default parseRoute;