import OpenAI from 'openai';
import pool from '../config/db.js';
import { addEvent, deleteEvent } from './eventController.js';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
export const parseTask = async (req, res) => {
    try {
        const { text } = req.body;
        const { userId } = req.user;

        if (!text) return res.status(400).json({ error: 'Missing text input' });

        // Log user message
        const insertMessageQuery = {
            text: `INSERT INTO messages (user_id, content, is_bot)
                   VALUES ($1, $2, false)
                   RETURNING id`,
            values: [userId, text],
        };
        const userMessage = await pool.query(insertMessageQuery);

        // Call OpenAI 
        // Note: handle user timezone in frontend, let it be EST for now
        const response = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content:
                        `Extract the task title, date, start_time, end_time, and intent from user input.
                        - Intent must be one of: schedule_event, delete_event, add_task, or null.
                        - If the user mentions an event or meeting, infer a short descriptive title (e.g. "Meeting with team").
                        - Always include "title" as a string.
                        - Return start_time and end_time in ISO 8601 format (e.g. 2025-10-23T15:00:00Z).
                        - Be aware that the user timezone is 'America/New_York'.
                        - Always assume the current year is ${new Date().getFullYear()} and today\’s date as reference when interpreting "tomorrow", "next week", etc.
                        - If a field cannot be determined, set it to null.
                        - Return strictly valid JSON only.`
                },
                { role: 'user', content: text },
            ],
            response_format: { type: 'json_object' },
        });

        const parsed = JSON.parse(response.choices[0].message.content);

        // If end_time is missing, add 1 hour to start time
        if (parsed.start_time && !parsed.end_time) {
            const start = new Date(parsed.start_time);
            if (!isNaN(start)) {
                const end = new Date(start.getTime() + 60 * 60 * 1000);
                parsed.end_time = end.toISOString();
            } else {
                parsed.start_time = null;
                parsed.end_time = null;
            }
        } else if (!parsed.start_time && parsed.end_time) {
            const end = new Date(parsed.end_time);
            if (!isNaN(end)) {
                const start = new Date(end.getTime() - 60 * 60 * 1000);
                parsed.start_time = start.toISOString();
            } else {
                parsed.start_time = null;
                parsed.end_time = null;
            }
        }

        // Log bot (parsed) response
        const insertBotMessageQuery = {
            text: `INSERT INTO messages (user_id, content, is_bot)
                   VALUES ($1, $2, true)
                   RETURNING id`,
            values: [userId, JSON.stringify(parsed)],
        };
        await pool.query(insertBotMessageQuery);

        // Access token for Google Calendar, replace in .env
        // This will be sent in req from frontend 
        const accessToken = process.env.GOOGLE_TEST_TOKEN;

        // Perform action
        if (parsed.intent === 'schedule_event') {
            req.body = { ...parsed, accessToken };
            return addEvent(req, res);
        }

        if (parsed.intent === 'delete_event') {
            req.body = { ...parsed, accessToken };
            return deleteEvent(req, res);
        }

        res.status(200).json({ parsed });
    } catch (err) {
        console.error('Error in parseTask:', err);
        res.status(500).json({ error: 'Failed to parse input' });
    }
};
