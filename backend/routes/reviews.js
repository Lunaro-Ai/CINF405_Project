import { Router } from 'express';
import pool from '../db/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.post('/', async (req, res) => {
  const entryId = req.params.entryId;
  const rating = req.body.rating;
  const text = req.body.text;
  const shared = req.body.shared;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  try {
    const entry = await pool.query(
      'SELECT id, status FROM game_entries WHERE id = $1 AND user_id = $2',
      [entryId, req.user.id]
    );
    if (entry.rows.length === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    if (entry.rows[0].status !== 'Completed') {
      return res.status(400).json({ error: 'You can only review a game after marking it Completed' });
    }

    const result = await pool.query(
      `INSERT INTO reviews (entry_id, user_id, rating, text, shared)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (entry_id) DO UPDATE
         SET rating = $3, text = $4, shared = $5, date_written = NOW()
       RETURNING id, rating, text, date_written, shared`,
      [entryId, req.user.id, rating, text || null, shared === true]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

export default router;
