import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pool from './db/db.js';
import authRoutes from './routes/auth.js';
import entriesRoutes from './routes/entries.js';
import notesRoutes from './routes/notes.js';
import reviewsRoutes from './routes/reviews.js';
import challengesRoutes from './routes/challenges.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT current_database()');
    res.json({ ok: true, database: result.rows[0].current_database });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/entries', entriesRoutes);
app.use('/api/entries/:entryId/notes', notesRoutes);
app.use('/api/entries/:entryId/review', reviewsRoutes);
app.use('/api/entries/:entryId/challenges', challengesRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
