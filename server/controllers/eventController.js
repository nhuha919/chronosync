import { google } from 'googleapis';
import pool from '../config/db.js';

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
export const addEvent = async (req, res) => {
    const { title, start_time, end_time, accessToken } = req.body;
    const { userId } = req.user;

    if (!title || !start_time || !end_time || !accessToken)
        return res.status(400).json({ error: 'Missing event fields' });

    try {
        // Create Google Calendar event
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });
        const calendar = google.calendar({ version: 'v3', auth });

        const event = {
            summary: title,
            start: { dateTime: start_time },
            end: { dateTime: end_time },
        };

        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
        });

        const googleEventId = response.data.id;

        // Store event in DB
        const insertEventQuery = {
            text: `INSERT INTO events (user_id, title, start_time, end_time, google_event_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            values: [userId, title, start_time, end_time, googleEventId],
        };
        const dbEvent = await pool.query(insertEventQuery);

        res.status(201).json({ message: 'Event created', event: dbEvent.rows[0] });
    } catch (error) {
        console.error('Google Calendar error:', error);
        res.status(500).json({ error: 'Failed to create event' });
    }
};
