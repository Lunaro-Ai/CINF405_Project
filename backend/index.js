import 'dotenv/config';
import express from 'express';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const app = express();

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT current_database()');
    res.json({ ok: true, database: result.rows[0].current_database });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});