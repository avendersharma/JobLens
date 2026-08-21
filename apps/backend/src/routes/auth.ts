import { Router } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcrypt';
import { db } from '../db/client';
import { generateToken, authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4001';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${BACKEND_URL}/api/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const picture = profile.photos?.[0]?.value;

        if (!email) {
          return done(new Error('No email from Google profile'));
        }

        // Find or create user
        let user = await db.query(
          'SELECT * FROM users WHERE google_id = $1',
          [googleId]
        );

        if (user.rows.length === 0) {
          // Create new user
          const result = await db.query(
            'INSERT INTO users (google_id, email, name, picture) VALUES ($1, $2, $3, $4) RETURNING *',
            [googleId, email, name, picture]
          );
          user = result;
        } else {
          // Update last login
          await db.query(
            'UPDATE users SET last_login = NOW() WHERE id = $1',
            [user.rows[0].id]
          );
        }

        return done(null, user.rows[0]);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

// Initiate Google OAuth flow
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false
}));

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=auth_failed` }),
  (req, res) => {
    const user = req.user as any;
    const token = generateToken(user.id, user.email, user.name);

    // Redirect to frontend with token in URL
    res.redirect(`${FRONTEND_URL}/login/callback?token=${token}`);
  }
);

// Get current user info (protected route)
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, email, name, picture, created_at FROM users WHERE id = $1',
      [req.userId]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Logout (client-side removes token, but this endpoint can be used for logging)
router.post('/logout', authenticateToken, (req: AuthRequest, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Register with email/password
router.post('/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      res.status(400).json({ error: 'email, name, and password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    // Check if email already exists
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const { rows } = await db.query(
      'INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING id, email, name, picture, created_at',
      [email, name, passwordHash]
    );

    const user = rows[0];
    const token = generateToken(user.id, user.email, user.name);
    res.status(201).json({ token, user });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Login with email/password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'email and password are required' });
      return;
    }

    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const user = rows[0];

    if (!user.password_hash) {
      res.status(400).json({ error: 'This account uses Google sign-in. Please continue with Google.' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    const token = generateToken(user.id, user.email, user.name);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, picture: user.picture, created_at: user.created_at } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

export { router as authRouter };
