import { Router } from 'express';
import pool from '../db/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.post('/', async (req, res) => {
  const entryId = req.params.entryId;
  const text = req.body.text;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: 'Note text is required' });
  }
  if (text.length > 5000) {
    return res.status(400).json({ error: 'Note must be 5000 characters or fewer' });
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
      'INSERT INTO journal_notes (entry_id, user_id, text) VALUES ($1, $2, $3) RETURNING id, text, date_written',
      [entryId, req.user.id, text.trim()]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.patch('/:noteId', async (req, res) => {
  const noteId = req.params.noteId;
  const text = req.body.text;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: 'Note text is required' });
  }
  if (text.length > 5000) {
    return res.status(400).json({ error: 'Note must be 5000 characters or fewer' });
  }

  try {
    const result = await pool.query(
      'UPDATE journal_notes SET text = $1 WHERE id = $2 AND user_id = $3 RETURNING id, text, date_written',
      [text.trim(), noteId, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.delete('/:noteId', async (req, res) => {
  const noteId = req.params.noteId;

  try {
    const result = await pool.query(
      'DELETE FROM journal_notes WHERE id = $1 AND user_id = $2 RETURNING id',
      [noteId, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

export default router;
