import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { auth } from '../firebaseAdmin.js';
import db from '../db/db.js'; 
import dotenv from 'dotenv';
import { generateToken } from '../utils/generateToken.js';

dotenv.config();

// Register a new user
export const register = async (req, res) => {
    const { email, password, name } = req.body;

    try {
        const password_hash = await bcrypt.hash(password, 10);

        const result = await db.query(
            'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id',
            [email, password_hash, name]
        );

        const user = result.rows[0];
        const token = generateToken(user);

        res.status(201).json({
            message: 'User registered successfully',
            token
        });
    } catch (error) {
        if (error.code === '23505') { 
            return res.status(400).json({ message: 'Email already registered' });
        }
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Login a user
export const login = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({message: 'Invalid credentials' });
        }
        const user = result.rows[0];

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user);

        res.json({ 
            message: 'Login successful',
            token 
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Login with Google
export const googleLogin = async (req, res) => {
    const { idToken } = req.body;

    try {
        const decode = await auth.verifyIdToken(idToken);
        const { uid, email, name } = decode;

        let result = await db.query('SELECT * FROM users WHERE firebase_uid = $1', [uid]);

        if (result.rows.length === 0) {
            const insertResult = await db.query(
                'INSERT INTO users (firebase_uid, email, name) VALUES ($1, $2, $3) RETURNING id',
                [uid, email, name]
            );
            user = insertResult.rows[0];
        } else {
            user = result.rows[0];
        }

        const token = generateToken(user);

        res.json({ 
            message: 'Google login successful',
            token
        });
    } catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}