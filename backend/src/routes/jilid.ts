import express from 'express';
import pool from '../config/database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM jilid ORDER BY jilid_id');
    res.json({ jilid: result.rows });
  } catch (error) {
    console.error('Get jilid error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM jilid WHERE jilid_id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Jilid not found' });
    }

    res.json({ jilid: result.rows[0] });
  } catch (error) {
    console.error('Get jilid error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id/letters', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT h.*, jl.sort_order 
       FROM hijaiyah h
       INNER JOIN jilid_letters jl ON h.hijaiyah_id = jl.hijaiyah_id
       WHERE jl.jilid_id = $1
       ORDER BY jl.sort_order`,
      [id]
    );

    res.json({ letters: result.rows });
  } catch (error) {
    console.error('Get jilid letters error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
