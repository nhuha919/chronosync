import OpenAI from 'openai';
import pool from '../config/db.js';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const parseTask = async (req, res) => {
    try {
        const { text } = req.body;
        const { userId } = req.user;

        if (!text) return res.status(400).json({ error: 'Missing text input' });

        // 1. Log user message
        const insertMessageQuery = {
            text: `INSERT INTO messages (user_id, content, is_bot)
             VALUES ($1, $2, false)
             RETURNING id`,
            values: [userId, text],
        };
        const userMessage = await pool.query(insertMessageQuery);

        // 2. Call OpenAI to parse
        const response = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'Extract the task title, date, and time from the user input.' },
                { role: 'user', content: text },
            ],
        });

        const parsed = response.choices[0].message.content;

        // 3. Log bot response
        const insertBotMessageQuery = {
            text: `INSERT INTO messages (user_id, content, is_bot)
             VALUES ($1, $2, true)
             RETURNING id`,
            values: [userId, parsed],
        };
        await pool.query(insertBotMessageQuery);

        res.status(200).json({ parsed });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to parse input' });
    }
};
