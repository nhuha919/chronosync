import express from "express";
import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config();

const googleCalendarRoute = express.Router();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// generate auth URL for frontend
googleCalendarRoute.get("/auth", (req, res) => {
  const scopes = ["https://www.googleapis.com/auth/calendar"];
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline", // get refresh token
    prompt: "consent",
    scope: scopes,
  });
  res.json({ url });
});

// OAuth callback
googleCalendarRoute.get("/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    res.json(tokens); // access_token + refresh_token
  } catch (err) {
    console.error("OAuth callback error:", err);
    res.status(500).json({ error: "OAuth2 callback failed" });
  }
});

export default googleCalendarRoute;
