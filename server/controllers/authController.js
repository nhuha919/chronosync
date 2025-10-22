import { auth } from '../config/firebase.js';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

export const loginWithGoogle = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'Missing ID token' });

    // 1) Verify token with Firebase
    const decodedToken = await auth.verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // 2) Find existing user by firebase_uid or email
    const selectUserQuery = {
      name: 'select-user-by-firebase-uid-or-email',
      text: `SELECT * FROM users WHERE firebase_uid = $1 OR email = $2 LIMIT 1`,
      values: [uid, email],
    };
    let result = await pool.query(selectUserQuery);

    // 3) Insert if not exists
    if (result.rows.length === 0) {
      const insertUserQuery = {
        name: 'insert-user',
        text: `INSERT INTO users (firebase_uid, name, email, created_at)
               VALUES ($1, $2, $3, now())
               RETURNING *`,
        values: [uid, name || null, email || null],
      };
      result = await pool.query(insertUserQuery);
    }

    const user = result.rows[0];

    // 4) Sign backend JWT (keep payload small)
    const token = jwt.sign(
      { uid, userId: user.id },            
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({ message: 'Google login successful', token, user });
  } catch (error) {
    console.error('Firebase verification error:', error);
    return res.status(401).json({ error: 'Invalid or expired Google token' });
  }
};
