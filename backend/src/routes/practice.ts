import express from 'express';
import pool from '../config/database';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const { targetUserId, hijaiyahId, status } = req.query;

    let query = `
      SELECT upp.*, h.latin_name, h.arabic_char, u.name as user_name
      FROM user_practice_progress upp
      INNER JOIN hijaiyah h ON upp.hijaiyah_id = h.hijaiyah_id
      INNER JOIN users u ON upp.user_id = u.user_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (userRole === 'murid') {
      query += ` AND upp.user_id = $${paramCount}`;
      params.push(userId);
      paramCount++;
    } else if (targetUserId) {
      query += ` AND upp.user_id = $${paramCount}`;
      params.push(targetUserId);
      paramCount++;
    }

    if (hijaiyahId) {
      query += ` AND upp.hijaiyah_id = $${paramCount}`;
      params.push(hijaiyahId);
      paramCount++;
    }

    if (status) {
      query += ` AND upp.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    query += ' ORDER BY h.ordinal';

    const result = await pool.query(query, params);
    res.json({ practices: result.rows });
  } catch (error) {
    console.error('Get practice progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const result = await pool.query(
      `SELECT upp.*, h.latin_name, h.arabic_char, u.name as user_name
       FROM user_practice_progress upp
       INNER JOIN hijaiyah h ON upp.hijaiyah_id = h.hijaiyah_id
       INNER JOIN users u ON upp.user_id = u.user_id
       WHERE upp.practice_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Practice progress not found' });
    }

    const practice = result.rows[0];

    if (userRole === 'murid' && practice.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ practice: practice });
  } catch (error) {
    console.error('Get practice progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { hijaiyahId, status, attempts } = req.body;

    if (!hijaiyahId || !status) {
      return res.status(400).json({ error: 'hijaiyahId and status are required' });
    }

    const hijaiyahCheck = await pool.query('SELECT hijaiyah_id FROM hijaiyah WHERE hijaiyah_id = $1', [hijaiyahId]);
    if (hijaiyahCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Hijaiyah not found' });
    }

    const result = await pool.query(
      `INSERT INTO user_practice_progress (user_id, hijaiyah_id, status, attempts)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, hijaiyah_id) 
       DO UPDATE SET status = $3, attempts = user_practice_progress.attempts + $4, last_update = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, hijaiyahId, status, attempts || 1]
    );

    res.json({ practice: result.rows[0] });
  } catch (error) {
    console.error('Update practice progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const { status, attempts } = req.body;

    const practiceCheck = await pool.query(
      'SELECT user_id FROM user_practice_progress WHERE practice_id = $1',
      [id]
    );

    if (practiceCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Practice progress not found' });
    }

    if (userRole === 'murid' && practiceCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Cannot update other user practice progress' });
    }

    const updates: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    if (status) {
      updates.push(`status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    if (attempts !== undefined) {
      updates.push(`attempts = $${paramCount}`);
      params.push(attempts);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('last_update = CURRENT_TIMESTAMP');
    params.push(id);
    const query = `UPDATE user_practice_progress SET ${updates.join(', ')} WHERE practice_id = $${paramCount} RETURNING *`;

    const result = await pool.query(query, params);

    res.json({ practice: result.rows[0] });
  } catch (error) {
    console.error('Update practice progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', requireRole(['guru']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM user_practice_progress WHERE practice_id = $1 RETURNING practice_id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Practice progress not found' });
    }

    res.json({ message: 'Practice progress deleted successfully' });
  } catch (error) {
    console.error('Delete practice progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
