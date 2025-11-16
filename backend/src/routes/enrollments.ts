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
 * /api/enrollments/room/{roomId}/members:
 *   get:
 *     summary: Get all members in a room
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of room members
 */
router.get('/room/:roomId/members', async (req: AuthRequest, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user!.userId;

    // Check if user is enrolled in this room
    const enrollmentCheck = await pool.query(
      'SELECT enrollment_id FROM enrollments WHERE user_id = $1 AND room_id = $2',
      [userId, roomId]
    );

    if (enrollmentCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You are not a member of this room' });
    }

    // Get all members with their details
    const result = await pool.query(
      `SELECT 
        e.enrollment_id,
        e.joined_at,
        u.user_id,
        u.name,
        u.email,
        u.role,
        CASE WHEN r.created_by = u.user_id THEN true ELSE false END as is_creator
       FROM enrollments e
       INNER JOIN users u ON e.user_id = u.user_id
       INNER JOIN rooms r ON e.room_id = r.room_id
       WHERE e.room_id = $1
       ORDER BY is_creator DESC, e.joined_at ASC`,
      [roomId]
    );

    res.json({ members: result.rows });
  } catch (error) {
    console.error('Get room members error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/enrollments/my-rooms:
 *   get:
 *     summary: Get all rooms that current user has joined
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of enrolled rooms
 */
router.get('/my-rooms', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    console.log('[my-rooms] Fetching rooms for user:', userId);

    const result = await pool.query(
      `SELECT 
        e.enrollment_id,
        e.joined_at,
        r.room_id,
        r.name,
        r.description,
        r.code,
        r.created_at,
        u.name as created_by_name
       FROM enrollments e
       INNER JOIN rooms r ON e.room_id = r.room_id
       INNER JOIN users u ON r.created_by = u.user_id
       WHERE e.user_id = $1
       ORDER BY e.joined_at DESC`,
      [userId]
    );

    console.log('[my-rooms] Found rooms:', result.rows.length);
    res.json({ rooms: result.rows });
  } catch (error) {
    console.error('[my-rooms] Error details:', error);
    if (error instanceof Error) {
      console.error('[my-rooms] Error message:', error.message);
      console.error('[my-rooms] Error stack:', error.stack);
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/enrollments/join:
 *   post:
 *     summary: Join room by code
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: Room code to join
 *     responses:
 *       201:
 *         description: Successfully joined room
 *       400:
 *         description: Invalid code or already enrolled
 *       404:
 *         description: Room not found
 */
router.post('/join', async (req: AuthRequest, res) => {
  try {
    const { code } = req.body;
    const userId = req.user!.userId;

    if (!code) {
      return res.status(400).json({ error: 'Room code is required' });
    }

    // Find room by code
    const roomResult = await pool.query(
      'SELECT room_id, name, description, code, created_by FROM rooms WHERE code = $1',
      [code.toUpperCase()]
    );

    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found with this code' });
    }

    const room = roomResult.rows[0];

    // Check if already enrolled
    const existingEnrollment = await pool.query(
      'SELECT enrollment_id FROM enrollments WHERE user_id = $1 AND room_id = $2',
      [userId, room.room_id]
    );

    if (existingEnrollment.rows.length > 0) {
      return res.status(400).json({ error: 'You are already enrolled in this room' });
    }

    // Create enrollment
    const result = await pool.query(
      'INSERT INTO enrollments (user_id, room_id) VALUES ($1, $2) RETURNING *',
      [userId, room.room_id]
    );

    res.status(201).json({ 
      message: 'Successfully joined room',
      enrollment: result.rows[0],
      room: room
    });
  } catch (error) {
    console.error('Join room error:', error);
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
