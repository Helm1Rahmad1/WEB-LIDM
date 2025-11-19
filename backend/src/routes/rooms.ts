import express from 'express';
import pool from '../config/database';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

/**
 * @swagger
 * /api/rooms:
 *   get:
 *     summary: Get all rooms (guru melihat rooms yang dibuat, murid melihat rooms yang diikuti)
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of rooms
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rooms:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;

    let query;
    let params;

    if (role === 'guru') {
      // Query untuk guru: ambil semua kelas yang dibuat, plus hitung jumlah murid
      query = `
        SELECT 
          r.*,
          COUNT(DISTINCT e.user_id) as student_count
        FROM rooms r
        LEFT JOIN enrollments e ON r.room_id = e.room_id
        WHERE r.created_by = $1
        GROUP BY r.room_id
        ORDER BY r.created_at DESC
      `;
      params = [userId];
    } else {
      // Query untuk murid: ambil kelas yang diikuti
      query = `
        SELECT 
          r.*,
          COUNT(DISTINCT e2.user_id) as student_count
        FROM rooms r
        INNER JOIN enrollments e ON r.room_id = e.room_id
        LEFT JOIN enrollments e2 ON r.room_id = e2.room_id
        WHERE e.user_id = $1
        GROUP BY r.room_id, e.joined_at
        ORDER BY e.joined_at DESC
      `;
      params = [userId];
    }

    const result = await pool.query(query, params);
    
    // Convert student_count dari string ke number
    const rooms = result.rows.map(room => ({
      ...room,
      student_count: parseInt(room.student_count) || 0
    }));
    
    res.json({ rooms });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/rooms:
 *   post:
 *     summary: Create new room (hanya guru)
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *             properties:
 *               name:
 *                 type: string
 *                 example: Kelas Hijaiyah A
 *               description:
 *                 type: string
 *                 example: Kelas belajar huruf hijaiyah untuk pemula
 *               code:
 *                 type: string
 *                 example: KELAS123
 *     responses:
 *       201:
 *         description: Room created successfully
 *       403:
 *         description: Only guru can create rooms
 */
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

/**
 * @swagger
 * /api/rooms/join:
 *   post:
 *     summary: Join room dengan kode (hanya murid)
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 example: KELAS123
 *     responses:
 *       200:
 *         description: Joined room successfully
 *       400:
 *         description: Already enrolled
 *       404:
 *         description: Room not found
 */
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

/**
 * @swagger
 * /api/rooms/{roomId}/students:
 *   get:
 *     summary: Get list murid di room (hanya guru)
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of students in room
 */
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

/**
 * @swagger
 * /api/rooms/{id}:
 *   get:
 *     summary: Get room detail by ID
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Room detail
 *       404:
 *         description: Room not found
 *       403:
 *         description: Not enrolled in this room
 */
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const role = req.user!.role;

    const result = await pool.query('SELECT * FROM rooms WHERE room_id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const room = result.rows[0];

    if (role === 'murid') {
      const enrollmentCheck = await pool.query(
        'SELECT enrollment_id FROM enrollments WHERE user_id = $1 AND room_id = $2',
        [userId, id]
      );

      if (enrollmentCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Not enrolled in this room' });
      }
    }

    res.json({ room: room });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/rooms/{id}:
 *   put:
 *     summary: Update room (hanya guru pemilik room)
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Room updated successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Room not found
 */
router.put('/:id', requireRole(['guru']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, description, code } = req.body;
    const userId = req.user!.userId;

    const roomCheck = await pool.query(
      'SELECT created_by FROM rooms WHERE room_id = $1',
      [id]
    );

    if (roomCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (roomCheck.rows[0].created_by !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this room' });
    }

    const updates: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    if (name) {
      updates.push(`name = $${paramCount}`);
      params.push(name);
      paramCount++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      params.push(description);
      paramCount++;
    }

    if (code) {
      const codeCheck = await pool.query(
        'SELECT room_id FROM rooms WHERE code = $1 AND room_id != $2',
        [code, id]
      );

      if (codeCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Code already exists' });
      }

      updates.push(`code = $${paramCount}`);
      params.push(code);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);
    const query = `UPDATE rooms SET ${updates.join(', ')} WHERE room_id = $${paramCount} RETURNING *`;

    const result = await pool.query(query, params);

    res.json({ room: result.rows[0] });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/rooms/{id}:
 *   delete:
 *     summary: Delete room (hanya guru pemilik room)
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Room deleted successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Room not found
 */
router.delete('/:id', requireRole(['guru']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const roomCheck = await pool.query(
      'SELECT created_by FROM rooms WHERE room_id = $1',
      [id]
    );

    if (roomCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (roomCheck.rows[0].created_by !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this room' });
    }

    await pool.query('DELETE FROM rooms WHERE room_id = $1', [id]);

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
