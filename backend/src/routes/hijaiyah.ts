import express from 'express';
import pool from '../config/database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM hijaiyah ORDER BY ordinal');
    res.json({ letters: result.rows });
  } catch (error) {
    console.error('Get hijaiyah error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM hijaiyah WHERE hijaiyah_id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Letter not found' });
    }

    res.json({ letter: result.rows[0] });
  } catch (error) {
    console.error('Get hijaiyah error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
