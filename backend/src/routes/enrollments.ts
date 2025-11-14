import express from 'express';
import pool from '../config/database';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

/**
 * @swagger
 * /api/enrollments:
 *   get:
 *     summary: Get all enrollments
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { roomId, userId } = req.query;
    const userRole = req.user!.role;
    const currentUserId = req.user!.userId;

    let query = `
      SELECT e.*, u.name, u.email, r.name as room_name 
      FROM enrollments e
      INNER JOIN users u ON e.user_id = u.user_id
      INNER JOIN rooms r ON e.room_id = r.room_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (roomId) {
      query += ` AND e.room_id = $${paramCount}`;
      params.push(roomId);
      paramCount++;
    }

    if (userId) {
      query += ` AND e.user_id = $${paramCount}`;
      params.push(userId);
      paramCount++;
    }

    if (userRole === 'murid') {
      query += ` AND e.user_id = $${paramCount}`;
      params.push(currentUserId);
      paramCount++;
    }

    query += ' ORDER BY e.joined_at DESC';

    const result = await pool.query(query, params);
    res.json({ enrollments: result.rows });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/enrollments/{id}:
 *   get:
 *     summary: Get enrollment by ID
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user!.role;
    const userId = req.user!.userId;

    const result = await pool.query(
      `SELECT e.*, u.name, u.email, r.name as room_name 
       FROM enrollments e
       INNER JOIN users u ON e.user_id = u.user_id
       INNER JOIN rooms r ON e.room_id = r.room_id
       WHERE e.enrollment_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    const enrollment = result.rows[0];

    if (userRole === 'murid' && enrollment.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ enrollment: enrollment });
  } catch (error) {
    console.error('Get enrollment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/enrollments:
 *   post:
 *     summary: Create enrollment
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { userId, roomId } = req.body;
    const userRole = req.user!.role;
    const currentUserId = req.user!.userId;

    if (!userId || !roomId) {
      return res.status(400).json({ error: 'userId and roomId are required' });
    }

    if (userRole === 'murid' && userId !== currentUserId) {
      return res.status(403).json({ error: 'Cannot enroll other users' });
    }

    const roomCheck = await pool.query('SELECT room_id FROM rooms WHERE room_id = $1', [roomId]);
    if (roomCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const userCheck = await pool.query('SELECT user_id FROM users WHERE user_id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existingEnrollment = await pool.query(
      'SELECT enrollment_id FROM enrollments WHERE user_id = $1 AND room_id = $2',
      [userId, roomId]
    );

    if (existingEnrollment.rows.length > 0) {
      return res.status(400).json({ error: 'User already enrolled in this room' });
    }

    const result = await pool.query(
      'INSERT INTO enrollments (user_id, room_id) VALUES ($1, $2) RETURNING *',
      [userId, roomId]
    );

    res.status(201).json({ enrollment: result.rows[0] });
  } catch (error) {
    console.error('Create enrollment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/enrollments/{id}:
 *   delete:
 *     summary: Delete enrollment
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user!.role;
    const userId = req.user!.userId;

    const enrollmentCheck = await pool.query(
      'SELECT user_id FROM enrollments WHERE enrollment_id = $1',
      [id]
    );

    if (enrollmentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    if (userRole === 'murid' && enrollmentCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Cannot delete other user enrollments' });
    }

    await pool.query('DELETE FROM enrollments WHERE enrollment_id = $1', [id]);

    res.json({ message: 'Enrollment deleted successfully' });
  } catch (error) {
    console.error('Delete enrollment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
