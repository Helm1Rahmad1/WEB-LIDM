import express from 'express';
import pool from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/letter', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { roomId } = req.query;

    const result = await pool.query(
      `SELECT ulp.*, h.latin_name, h.arabic_char 
       FROM user_letter_progress ulp
       INNER JOIN hijaiyah h ON ulp.hijaiyah_id = h.hijaiyah_id
       WHERE ulp.user_id = $1 AND ulp.room_id = $2
       ORDER BY h.ordinal`,
      [userId, roomId]
    );

    res.json({ progress: result.rows });
  } catch (error) {
    console.error('Get letter progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/jilid', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { roomId } = req.query;

    const result = await pool.query(
      `SELECT ujp.*, j.jilid_name, j.description 
       FROM user_jilid_progress ujp
       INNER JOIN jilid j ON ujp.jilid_id = j.jilid_id
       WHERE ujp.user_id = $1 AND ujp.room_id = $2
       ORDER BY j.jilid_id`,
      [userId, roomId]
    );

    res.json({ progress: result.rows });
  } catch (error) {
    console.error('Get jilid progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/letter', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { roomId, hijaiyahId, status } = req.body;

    const result = await pool.query(
      `INSERT INTO user_letter_progress (user_id, room_id, hijaiyah_id, status)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, room_id, hijaiyah_id) 
       DO UPDATE SET status = $4, last_update = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, roomId, hijaiyahId, status]
    );

    res.json({ progress: result.rows[0] });
  } catch (error) {
    console.error('Update letter progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
