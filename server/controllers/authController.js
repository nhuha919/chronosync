import { auth } from '../config/firebase.js';
import jwt from 'jsonwebtoken';

export const loginWithGoogle = async (req, res) => {
    try {
        // Get ID token from the frontend
        const idToken = req.body.idToken; 
        if (!idToken)
            return res.status(400).json({ error: 'Missing ID token'});

        // Verify Firebase ID token
        const decodedToken = await auth.verifyIdToken(idToken);
        const { uid, email, name, picture } = decodedToken;

        // Create jwt token
        const token = jwt.sign(
            { uid, uid, email, name, picture },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json.status(200).json({
            message: 'Google login successful',
            token,
            user: { uid, email, name, picture }
        });
    } catch (err) {
        console.error(err)
        res.status(401).json({ error: 'Invalid or expired Google token' })
    }
};