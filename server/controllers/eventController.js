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

    // for debugging
    console.log("DEBUG EVENT BODY:", { title, start_time, end_time, accessToken });

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

/**
 * DELETE /api/events/delete
 * Delete an existing event from both Google Calendar and the database.
 * 
 * Request body:
 * {
 *   "google_event_id": "<Google Calendar event ID>",
 *   "accessToken": "<Google OAuth access token>"
 * }
 * 
 * Header:
 * Authorization: Bearer <JWT>
 * 
 * Example:
 * {
 *   "google_event_id": "abcd1234efgh5678",
 *   "accessToken": "ya29.a0AfH6SM..."
 * }
 * 
 * Response:
 * 200 OK
 * {
 *   "message": "Event deleted successfully"
 * }
 */
export const deleteEvent = async (req, res) => {
    const { google_event_id, accessToken } = req.body;
    const { userId } = req.user;

    if (!google_event_id || !accessToken)
        return res.status(400).json({ error: 'Missing required fields' });

    try {
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });
        const calendar = google.calendar({ version: 'v3', auth });

        await calendar.events.delete({
            calendarId: 'primary',
            eventId: google_event_id,
        });

        await pool.query(
            `DELETE FROM events WHERE user_id = $1 AND google_event_id = $2`,
            [userId, google_event_id]
        );

        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
};

/**
 * PUT /api/events/update
 * Update an existing Google Calendar event and sync the database.
 * 
 * Request body:
 * {
 *   "google_event_id": "<Google Calendar event ID>",
 *   "title": "Updated meeting title",
 *   "start_time": "2025-10-23T17:00:00Z",
 *   "end_time": "2025-10-23T18:00:00Z",
 *   "accessToken": "<Google OAuth access token>"
 * }
 * 
 * Header:
 * Authorization: Bearer <JWT>
 * 
 * Example:
 * {
 *   "google_event_id": "abcd1234efgh5678",
 *   "title": "New Team Sync",
 *   "start_time": "2025-10-23T17:00:00Z",
 *   "end_time": "2025-10-23T18:00:00Z",
 *   "accessToken": "ya29.a0AfH6SM..."
 * }
 * 
 * Response:
 * 200 OK
 * {
 *   "message": "Event updated",
 *   "event": { ...updated event data... }
 * }
 */
export const updateEvent = async (req, res) => {
    const { google_event_id, title, start_time, end_time, accessToken } = req.body;
    const { userId } = req.user;

    if (!google_event_id || !accessToken)
        return res.status(400).json({ error: 'Missing required fields' });

    try {
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });
        const calendar = google.calendar({ version: 'v3', auth });

        const eventUpdate = {
            summary: title,
            start: { dateTime: start_time },
            end: { dateTime: end_time },
        };

        await calendar.events.update({
            calendarId: 'primary',
            eventId: google_event_id,
            resource: eventUpdate,
        });

        const updated = await pool.query(
            `UPDATE events
         SET title = COALESCE($1, title),
             start_time = COALESCE($2, start_time),
             end_time = COALESCE($3, end_time)
         WHERE user_id = $4 AND google_event_id = $5
         RETURNING *`,
            [title, start_time, end_time, userId, google_event_id]
        );

        res.status(200).json({ message: 'Event updated', event: updated.rows[0] });
    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({ error: 'Failed to update event' });
    }
};

/**
 * GET /api/events
 * Retrieve all events for the authenticated user from the database.
 * 
 * Header:
 * Authorization: Bearer <JWT>
 * 
 * Example (no body needed):
 * GET http://localhost:5000/api/events
 * 
 * Response:
 * 200 OK
 * {
 *   "events": [
 *     {
 *       "id": 1,
 *       "title": "Meeting with team",
 *       "start_time": "2025-10-23T15:00:00Z",
 *       "end_time": "2025-10-23T16:00:00Z",
 *       "google_event_id": "abcd1234efgh5678"
 *     }
 *   ]
 * }
 */
export const listAllEvents = async (req, res) => {
    const { userId } = req.user;
    try {
        const result = await pool.query(
            `SELECT * FROM events WHERE user_id = $1 ORDER BY start_time ASC`,
            [userId]
        );
        res.status(200).json({ events: result.rows });
    } catch (error) {
        console.error('List events error:', error);
        res.status(500).json({ error: 'Failed to retrieve events' });
    }
};