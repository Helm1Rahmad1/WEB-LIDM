import express from 'express';
import pool from '../config/database';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const { roomId, hijaiyahId, status } = req.query;

    let query = `
      SELECT lt.*, h.latin_name, h.arabic_char, j.jilid_name, u.name as user_name
      FROM letter_tests lt
      INNER JOIN hijaiyah h ON lt.hijaiyah_id = h.hijaiyah_id
      LEFT JOIN jilid j ON lt.jilid_id = j.jilid_id
      INNER JOIN users u ON lt.user_id = u.user_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (userRole === 'murid') {
      query += ` AND lt.user_id = $${paramCount}`;
      params.push(userId);
      paramCount++;
    }

    if (roomId) {
      query += ` AND lt.room_id = $${paramCount}`;
      params.push(roomId);
      paramCount++;
    }

    if (hijaiyahId) {
      query += ` AND lt.hijaiyah_id = $${paramCount}`;
      params.push(hijaiyahId);
      paramCount++;
    }

    if (status) {
      query += ` AND lt.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    query += ' ORDER BY lt.tested_at DESC';

    const result = await pool.query(query, params);
    res.json({ tests: result.rows });
  } catch (error) {
    console.error('Get tests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const result = await pool.query(
      `SELECT lt.*, h.latin_name, h.arabic_char, j.jilid_name, u.name as user_name
       FROM letter_tests lt
       INNER JOIN hijaiyah h ON lt.hijaiyah_id = h.hijaiyah_id
       LEFT JOIN jilid j ON lt.jilid_id = j.jilid_id
       INNER JOIN users u ON lt.user_id = u.user_id
       WHERE lt.test_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const test = result.rows[0];

    if (userRole === 'murid' && test.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ test: test });
  } catch (error) {
    console.error('Get test error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { roomId, hijaiyahId, jilidId, score, status } = req.body;

    if (!roomId || !hijaiyahId || score === undefined) {
      return res.status(400).json({ error: 'roomId, hijaiyahId, and score are required' });
    }

    const roomCheck = await pool.query('SELECT room_id FROM rooms WHERE room_id = $1', [roomId]);
    if (roomCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const hijaiyahCheck = await pool.query('SELECT hijaiyah_id FROM hijaiyah WHERE hijaiyah_id = $1', [hijaiyahId]);
    if (hijaiyahCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Hijaiyah not found' });
    }

    const result = await pool.query(
      `INSERT INTO letter_tests (user_id, room_id, hijaiyah_id, jilid_id, score, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, roomId, hijaiyahId, jilidId || null, score, status || 'belum_lulus']
    );

    res.status(201).json({ test: result.rows[0] });
  } catch (error) {
    console.error('Create test error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', requireRole(['guru']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { score, status, jilidId } = req.body;

    const updates: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    if (score !== undefined) {
      updates.push(`score = $${paramCount}`);
      params.push(score);
      paramCount++;
    }

    if (status) {
      updates.push(`status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    if (jilidId !== undefined) {
      updates.push(`jilid_id = $${paramCount}`);
      params.push(jilidId);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);
    const query = `UPDATE letter_tests SET ${updates.join(', ')} WHERE test_id = $${paramCount} RETURNING *`;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test not found' });
    }

    res.json({ test: result.rows[0] });
  } catch (error) {
    console.error('Update test error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const testCheck = await pool.query(
      'SELECT user_id FROM letter_tests WHERE test_id = $1',
      [id]
    );

    if (testCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Test not found' });
    }

    if (userRole === 'murid' && testCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Cannot delete other user tests' });
    }

    await pool.query('DELETE FROM letter_tests WHERE test_id = $1', [id]);

    res.json({ message: 'Test deleted successfully' });
  } catch (error) {
    console.error('Delete test error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
