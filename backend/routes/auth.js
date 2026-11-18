import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/db.js';

const router = Router();

router.post('/register', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const displayName = req.body.display_name;

  if (!email || !password || !displayName) {
    return res.status(400).json({ error: 'Please fill in all fields' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (email, password_hash, display_name) VALUES ($1, $2, $3) RETURNING id, email, display_name',
      [email, hashedPassword, displayName]
    );

    const newUser = result.rows[0];

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, display_name: newUser.display_name },
      process.env.JWT_SECRET
    );

    res.json({ token: token, user: newUser });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.post('/login', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please fill in all fields' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Wrong email or password' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Wrong email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, display_name: user.display_name },
      process.env.JWT_SECRET
    );

    res.json({
      token: token,
      user: { id: user.id, email: user.email, display_name: user.display_name }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

export default router;
