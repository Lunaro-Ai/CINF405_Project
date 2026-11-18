import { Router } from 'express';
import pool from '../db/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.post('/', async (req, res) => {
  const entryId = req.params.entryId;
  const description = req.body.description;

  if (!description || description.trim().length === 0) {
    return res.status(400).json({ error: 'Description is required' });
  }

  try {
    const entry = await pool.query(
      'SELECT id FROM game_entries WHERE id = $1 AND user_id = $2',
      [entryId, req.user.id]
    );
    if (entry.rows.length === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    const result = await pool.query(
      'INSERT INTO challenges (entry_id, user_id, description) VALUES ($1, $2, $3) RETURNING id, description, done, created_at',
      [entryId, req.user.id, description.trim()]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.patch('/:challengeId/done', async (req, res) => {
  const challengeId = req.params.challengeId;

  try {
    const result = await pool.query(
      'UPDATE challenges SET done = NOT done WHERE id = $1 AND user_id = $2 RETURNING id, description, done',
      [challengeId, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.delete('/:challengeId', async (req, res) => {
  const challengeId = req.params.challengeId;

  try {
    const result = await pool.query(
      'DELETE FROM challenges WHERE id = $1 AND user_id = $2 RETURNING id',
      [challengeId, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

export default router;
