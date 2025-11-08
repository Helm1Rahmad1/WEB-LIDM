import express from 'express';
import pool from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { roomId } = req.query;

    const result = await pool.query(
      `SELECT lt.*, h.latin_name, h.arabic_char, j.jilid_name
       FROM letter_tests lt
       INNER JOIN hijaiyah h ON lt.hijaiyah_id = h.hijaiyah_id
       LEFT JOIN jilid j ON lt.jilid_id = j.jilid_id
       WHERE lt.user_id = $1 AND lt.room_id = $2
       ORDER BY lt.tested_at DESC`,
      [userId, roomId]
    );

    res.json({ tests: result.rows });
  } catch (error) {
    console.error('Get tests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { roomId, hijaiyahId, jilidId, score, status } = req.body;

    const result = await pool.query(
      `INSERT INTO letter_tests (user_id, room_id, hijaiyah_id, jilid_id, score, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, roomId, hijaiyahId, jilidId, score, status]
    );

    res.status(201).json({ test: result.rows[0] });
  } catch (error) {
    console.error('Create test error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
