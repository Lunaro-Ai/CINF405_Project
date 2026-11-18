import { Router } from 'express';
import pool from '../db/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ge.id, ge.status, ge.date_added, ge.date_updated,
              g.id AS game_id, g.title, g.release_year, g.platform,
              r.rating, r.shared
         FROM game_entries ge
         JOIN games g ON g.id = ge.game_id
         LEFT JOIN reviews r ON r.entry_id = ge.id
        WHERE ge.user_id = $1
        ORDER BY ge.date_updated DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.post('/', async (req, res) => {
  const title = req.body.title;
  const releaseYear = req.body.release_year;
  const platform = req.body.platform;
  const status = req.body.status;

  const validStatuses = ['Want to Play', 'Playing', 'Completed', 'Dropped'];

  if (!title || !status) {
    return res.status(400).json({ error: 'Title and status are required' });
  }
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const existing = await pool.query(
      `SELECT id FROM games
        WHERE LOWER(title) = LOWER($1)
          AND (platform = $2 OR ($2 IS NULL AND platform IS NULL))`,
      [title, platform || null]
    );

    let gameId;
    if (existing.rows.length === 0) {
      const newGame = await pool.query(
        'INSERT INTO games (title, release_year, platform) VALUES ($1, $2, $3) RETURNING id',
        [title, releaseYear || null, platform || null]
      );
      gameId = newGame.rows[0].id;
    } else {
      gameId = existing.rows[0].id;
    }

    const entry = await pool.query(
      `INSERT INTO game_entries (user_id, game_id, status)
       VALUES ($1, $2, $3)
       RETURNING id, status, date_added, date_updated`,
      [req.user.id, gameId, status]
    );

    res.json({
      ...entry.rows[0],
      game_id: gameId,
      title: title,
      release_year: releaseYear || null,
      platform: platform || null,
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'This game is already in your journal' });
    }
    console.log(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.get('/:id', async (req, res) => {
  const entryId = req.params.id;

  try {
    const entryResult = await pool.query(
      `SELECT ge.id, ge.status, ge.date_added, ge.date_updated,
              g.id AS game_id, g.title, g.release_year, g.platform
         FROM game_entries ge
         JOIN games g ON g.id = ge.game_id
        WHERE ge.id = $1 AND ge.user_id = $2`,
      [entryId, req.user.id]
    );

    if (entryResult.rows.length === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    const notes = await pool.query(
      'SELECT id, text, date_written FROM journal_notes WHERE entry_id = $1 ORDER BY date_written ASC',
      [entryId]
    );
    const review = await pool.query(
      'SELECT id, rating, text, date_written, shared FROM reviews WHERE entry_id = $1',
      [entryId]
    );
    const challenges = await pool.query(
      'SELECT id, description, done, created_at FROM challenges WHERE entry_id = $1 ORDER BY created_at ASC',
      [entryId]
    );

    res.json({
      ...entryResult.rows[0],
      notes: notes.rows,
      review: review.rows[0] || null,
      challenges: challenges.rows,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.patch('/:id/status', async (req, res) => {
  const entryId = req.params.id;
  const status = req.body.status;

  const validStatuses = ['Want to Play', 'Playing', 'Completed', 'Dropped'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const result = await pool.query(
      `UPDATE game_entries
          SET status = $1, date_updated = NOW()
        WHERE id = $2 AND user_id = $3
        RETURNING id, status, date_updated`,
      [status, entryId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.delete('/:id', async (req, res) => {
  const entryId = req.params.id;

  try {
    const result = await pool.query(
      'DELETE FROM game_entries WHERE id = $1 AND user_id = $2 RETURNING id',
      [entryId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

export default router;
