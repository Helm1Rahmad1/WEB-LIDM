import express from 'express';
import pool from '../config/database';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;

    let query;
    let params;

    if (role === 'guru') {
      query = 'SELECT * FROM rooms WHERE created_by = $1 ORDER BY created_at DESC';
      params = [userId];
    } else {
      query = `
        SELECT r.* FROM rooms r
        INNER JOIN enrollments e ON r.room_id = e.room_id
        WHERE e.user_id = $1
        ORDER BY e.joined_at DESC
      `;
      params = [userId];
    }

    const result = await pool.query(query, params);
    res.json({ rooms: result.rows });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', requireRole(['guru']), async (req: AuthRequest, res) => {
  try {
    const { name, description, code } = req.body;
    const createdBy = req.user!.userId;

    const result = await pool.query(
      'INSERT INTO rooms (name, description, code, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, code, createdBy]
    );

    res.status(201).json({ room: result.rows[0] });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/join', requireRole(['murid']), async (req: AuthRequest, res) => {
  try {
    const { code } = req.body;
    const userId = req.user!.userId;

    const roomResult = await pool.query('SELECT room_id FROM rooms WHERE code = $1', [code]);
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const roomId = roomResult.rows[0].room_id;

    const enrollmentExists = await pool.query(
      'SELECT * FROM enrollments WHERE user_id = $1 AND room_id = $2',
      [userId, roomId]
    );

    if (enrollmentExists.rows.length > 0) {
      return res.status(400).json({ error: 'Already enrolled' });
    }

    await pool.query(
      'INSERT INTO enrollments (user_id, room_id) VALUES ($1, $2)',
      [userId, roomId]
    );

    res.json({ message: 'Joined room successfully' });
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:roomId/students', requireRole(['guru']), async (req: AuthRequest, res) => {
  try {
    const { roomId } = req.params;

    const result = await pool.query(
      `SELECT u.user_id, u.name, u.email, e.joined_at 
       FROM users u
       INNER JOIN enrollments e ON u.user_id = e.user_id
       WHERE e.room_id = $1 AND u.role = 'murid'
       ORDER BY e.joined_at DESC`,
      [roomId]
    );

    res.json({ students: result.rows });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
