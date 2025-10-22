import OpenAI from 'openai';
import pool from '../config/db.js';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
        const response = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content:
                        `Extract the task title, date, start_time, end_time, and intent from user input. Intent must be one of: schedule_event, add_task, or null. 
                        If not found, leave as null. 'Return start_time and end_time in ISO 8601 format (e.g. 2025-10-23T15:00:00Z). Return strictly valid JSON.`
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
            const end = new Date(parsed.end);
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

        res.status(200).json({ parsed });
    } catch (err) {
        console.error('Error in parseTask:', err);
        res.status(500).json({ error: 'Failed to parse input' });
    }
};
