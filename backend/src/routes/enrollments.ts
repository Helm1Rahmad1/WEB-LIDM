import express from 'express';
import pool from '../config/database';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Version endpoint to check deployment
router.get('/debug/version', (req, res) => {
  res.json({ 
    version: 'v1.4.0', 
    timestamp: new Date().toISOString(),
    message: 'Fixed my-rooms endpoint with better error handling and database structure validation',
    deployed: true
  });
});

// Debug endpoint to check table structures and foreign key relationships
router.get('/debug/check-tables', async (req, res) => {
  try {
    // Check if rooms table exists and structure
    const roomsCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'rooms'
    `);
    
    // Check rooms table structure
    const roomsStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'rooms'
      ORDER BY ordinal_position
    `);
    
    // Check foreign key constraints
    const foreignKeys = await pool.query(`
      SELECT
        tc.constraint_name, 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND (tc.table_name = 'enrollments' OR tc.table_name = 'rooms')
    `);
    
    // Sample data check
    const roomsCount = await pool.query('SELECT COUNT(*) as count FROM rooms');
    const sampleRooms = await pool.query('SELECT * FROM rooms LIMIT 3');
    
    res.json({
      success: true,
      roomsTableExists: roomsCheck.rows.length > 0,
      roomsStructure: roomsStructure.rows,
      foreignKeys: foreignKeys.rows,
      totalRooms: roomsCount.rows[0].count,
      sampleRooms: sampleRooms.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
});

// Test endpoint for any user ID 
router.get('/debug/test-user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userIdInt = parseInt(userId, 10);
    
    if (isNaN(userIdInt)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    // Check enrollments
    const enrollCheck = await pool.query('SELECT * FROM enrollments WHERE user_id = $1', [userIdInt]);
    console.log(`[debug] User ${userIdInt} has ${enrollCheck.rows.length} enrollments`);
    
    // Check if rooms exist for these enrollments
    let roomsExist = [];
    if (enrollCheck.rows.length > 0) {
      for (const enrollment of enrollCheck.rows) {
        const roomCheck = await pool.query('SELECT * FROM rooms WHERE room_id = $1', [enrollment.room_id]);
        roomsExist.push({
          enrollment_id: enrollment.enrollment_id,
          room_id: enrollment.room_id,
          room_exists: roomCheck.rows.length > 0,
          room_data: roomCheck.rows[0] || null
        });
      }
    }
    
    // Try JOIN query
    let joinResult: { rows: any[], error: string | null } = { rows: [], error: null };
    try {
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
        [userIdInt]
      );
      joinResult.rows = result.rows;
    } catch (joinError) {
      joinResult.error = joinError instanceof Error ? joinError.message : 'Unknown join error';
    }
    
    res.json({
      success: true,
      userId: userIdInt,
      enrollmentsCount: enrollCheck.rows.length,
      enrollments: enrollCheck.rows,
      roomsExistCheck: roomsExist,
      joinResult: joinResult,
      roomsCount: joinResult.rows.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
});

// Debug endpoint - test database connection (no auth required)
router.get('/debug/test-db', async (req, res) => {
  try {
    console.log('[debug] Testing database connection...');
    
    // Test 1: Simple query
    const testQuery = await pool.query('SELECT NOW() as time');
    console.log('[debug] ✅ Basic query works');
    
    // Test 2: Check if enrollments table exists
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'enrollments'
    `);
    console.log('[debug] Enrollments table exists:', tableCheck.rows.length > 0);
    
    // Test 3: Check enrollments table structure
    const structureCheck = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'enrollments'
      ORDER BY ordinal_position
    `);
    console.log('[debug] Enrollments columns:', structureCheck.rows);
    
    // Test 4: Check users table structure
    const usersStructure = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    console.log('[debug] Users columns:', usersStructure.rows);
    
    // Test 5: Count enrollments
    const countResult = await pool.query('SELECT COUNT(*) as count FROM enrollments');
    console.log('[debug] Total enrollments:', countResult.rows[0].count);
    
    // Test 6: Sample enrollment
    const sampleResult = await pool.query('SELECT * FROM enrollments LIMIT 1');
    console.log('[debug] Sample enrollment:', sampleResult.rows[0]);
    
    res.json({
      success: true,
      currentTime: testQuery.rows[0].time,
      enrollmentsTableExists: tableCheck.rows.length > 0,
      enrollmentsColumns: structureCheck.rows,
      usersColumns: usersStructure.rows,
      totalEnrollments: countResult.rows[0].count,
      sampleEnrollment: sampleResult.rows[0] || null
    });
  } catch (error) {
    console.error('[debug] Database test failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
});

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
      LEFT JOIN users u ON e.user_id = u.user_id
      LEFT JOIN rooms r ON e.room_id = r.room_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (roomId) {
      // Validate roomId if provided
      const roomIdInt = typeof roomId === 'string' ? parseInt(roomId as string, 10) : roomId;
      if (!isNaN(Number(roomIdInt))) {
        query += ` AND e.room_id = $${paramCount}`;
        params.push(roomIdInt);
        paramCount++;
      }
    }

    if (userId) {
      // Validate userId if provided
      const userIdInt = typeof userId === 'string' ? parseInt(userId as string, 10) : userId;
      if (!isNaN(Number(userIdInt))) {
        query += ` AND e.user_id = $${paramCount}`;
        params.push(userIdInt);
        paramCount++;
      }
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
    res.status(500).json({ 
      enrollments: [], 
      error: 'Failed to fetch enrollments',
      message: 'An error occurred while retrieving enrollments' 
    });
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
    
    // Validate roomId
    const roomIdInt = typeof roomId === 'string' ? parseInt(roomId, 10) : roomId;
    if (isNaN(roomIdInt)) {
      return res.status(400).json({ members: [], error: 'Invalid room ID' });
    }

    // Check if user is enrolled in this room
    const enrollmentCheck = await pool.query(
      'SELECT enrollment_id FROM enrollments WHERE user_id = $1 AND room_id = $2',
      [userId, roomIdInt]
    );

    if (enrollmentCheck.rows.length === 0) {
      return res.status(403).json({ members: [], error: 'You are not a member of this room' });
    }

    // Get all members with their details using LEFT JOIN to handle missing user data
    const result = await pool.query(
      `SELECT 
        e.enrollment_id,
        e.joined_at,
        u.user_id,
        COALESCE(u.name, 'Unknown User') as name,
        COALESCE(u.email, 'no-email@unknown.com') as email,
        COALESCE(u.role, 'murid') as role,
        CASE WHEN r.created_by = u.user_id THEN true ELSE false END as is_creator
       FROM enrollments e
       LEFT JOIN users u ON e.user_id = u.user_id
       INNER JOIN rooms r ON e.room_id = r.room_id
       WHERE e.room_id = $1
       ORDER BY is_creator DESC, e.joined_at ASC`,
      [roomIdInt]
    );

    res.json({ members: result.rows });
  } catch (error) {
    console.error('Get room members error:', error);
    res.status(500).json({ members: [], error: 'Failed to fetch room members' });
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
router.get('/my-rooms-simple', async (req: AuthRequest, res) => {
  try {
    console.log('[my-rooms-simple] Starting simple endpoint test...');
    const userId = req.user!.userId;
    console.log('[my-rooms-simple] User ID:', userId);
    
    // Validate userId type and convert if necessary
    const userIdInt = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    if (isNaN(userIdInt)) {
      console.error('[my-rooms-simple] Invalid user ID:', userId);
      return res.status(400).json({ rooms: [], error: 'Invalid user ID' });
    }
    
    // Use LEFT JOIN to handle missing creators gracefully and provide fallback data
    const result = await pool.query(
      `SELECT 
        e.enrollment_id,
        e.joined_at,
        r.room_id,
        r.name,
        r.description,
        r.code,
        r.created_at,
        COALESCE(u.name, 'Unknown Creator') as created_by_name
       FROM enrollments e
       INNER JOIN rooms r ON e.room_id = r.room_id
       LEFT JOIN users u ON r.created_by = u.user_id
       WHERE e.user_id = $1
       ORDER BY e.joined_at DESC`,
      [userIdInt]
    );
    
    console.log('[my-rooms-simple] Query successful, found:', result.rows.length);
    console.log('[my-rooms-simple] Results:', JSON.stringify(result.rows));
    res.json({ rooms: result.rows });
  } catch (error) {
    console.error('[my-rooms-simple] Error:', error);
    // Always return the expected format for Android client to prevent crashes
    res.status(500).json({ 
      rooms: [], 
      error: 'Failed to fetch rooms',
      message: 'An error occurred while retrieving your rooms'
    });
  }
});

router.get('/my-rooms', async (req: AuthRequest, res) => {
  try {
    console.log('[my-rooms] Starting endpoint...');
    console.log('[my-rooms] Request user object:', req.user);
    
    if (!req.user || !req.user.userId) {
      console.error('[my-rooms] No user in request');
      return res.status(401).json({ rooms: [], error: 'User not authenticated' });
    }

    const userId = req.user!.userId;
    console.log('[my-rooms] Fetching rooms for user:', userId);
    console.log('[my-rooms] User type:', typeof userId);
    
    // Convert userId to integer if it's a string
    const userIdInt = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    console.log('[my-rooms] Converted user ID:', userIdInt, 'type:', typeof userIdInt);

    // Validate userId is a valid number
    if (isNaN(userIdInt)) {
      console.error('[my-rooms] Invalid user ID:', userId);
      return res.status(400).json({ rooms: [], error: 'Invalid user ID' });
    }

    // Try with LEFT JOIN to handle missing creators gracefully
    console.log('[my-rooms] Starting JOIN query...');
    const result = await pool.query(
      `SELECT 
        e.enrollment_id,
        e.joined_at,
        r.room_id,
        r.name,
        r.description,
        r.code,
        r.created_at,
        COALESCE(u.name, 'Unknown Creator') as created_by_name,
        r.created_by
       FROM enrollments e
       INNER JOIN rooms r ON e.room_id = r.room_id
       LEFT JOIN users u ON r.created_by = u.user_id
       WHERE e.user_id = $1
       ORDER BY e.joined_at DESC`,
      [userIdInt]
    );

    console.log('[my-rooms] Found rooms after JOIN:', result.rows.length);
    console.log('[my-rooms] Rooms:', JSON.stringify(result.rows));
    console.log('[my-rooms] Sending successful response');
    res.json({ rooms: result.rows });
  } catch (error) {
    console.error('[my-rooms] Error:', error);
    if (error instanceof Error) {
      console.error('[my-rooms] Error message:', error.message);
      console.error('[my-rooms] Error stack:', error.stack);
    }
    // Always return the expected { rooms: [...] } format for Android client to prevent crashes
    res.status(500).json({ 
      rooms: [],
      error: 'Failed to fetch rooms',
      message: 'An error occurred while retrieving your rooms' 
    });
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
    
    // Validate the id parameter
    const idInt = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(idInt)) {
      return res.status(400).json({ error: 'Invalid enrollment ID' });
    }

    const result = await pool.query(
      `SELECT e.*, 
       COALESCE(u.name, 'Unknown User') as name, 
       COALESCE(u.email, 'no-email@unknown.com') as email, 
       COALESCE(r.name, 'Unknown Room') as room_name 
       FROM enrollments e
       LEFT JOIN users u ON e.user_id = u.user_id
       LEFT JOIN rooms r ON e.room_id = r.room_id
       WHERE e.enrollment_id = $1`,
      [idInt]
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
    res.status(500).json({ error: 'Failed to fetch enrollment' });
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
    res.status(500).json({ 
      error: 'Failed to join room',
      message: 'An error occurred while joining the room' 
    });
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

    // Validate userId and roomId
    const userIdInt = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    const roomIdInt = typeof roomId === 'string' ? parseInt(roomId, 10) : roomId;
    
    if (isNaN(userIdInt) || isNaN(roomIdInt)) {
      return res.status(400).json({ error: 'Invalid userId or roomId' });
    }

    if (userRole === 'murid' && userIdInt !== currentUserId) {
      return res.status(403).json({ error: 'Cannot enroll other users' });
    }

    const roomCheck = await pool.query('SELECT room_id FROM rooms WHERE room_id = $1', [roomIdInt]);
    if (roomCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const userCheck = await pool.query('SELECT user_id FROM users WHERE user_id = $1', [userIdInt]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existingEnrollment = await pool.query(
      'SELECT enrollment_id FROM enrollments WHERE user_id = $1 AND room_id = $2',
      [userIdInt, roomIdInt]
    );

    if (existingEnrollment.rows.length > 0) {
      return res.status(400).json({ error: 'User already enrolled in this room' });
    }

    const result = await pool.query(
      'INSERT INTO enrollments (user_id, room_id) VALUES ($1, $2) RETURNING *',
      [userIdInt, roomIdInt]
    );

    res.status(201).json({ enrollment: result.rows[0] });
  } catch (error) {
    console.error('Create enrollment error:', error);
    res.status(500).json({ 
      error: 'Failed to create enrollment',
      message: 'An error occurred while creating the enrollment' 
    });
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
    
    // Validate the id parameter
    const idInt = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(idInt)) {
      return res.status(400).json({ error: 'Invalid enrollment ID' });
    }

    const enrollmentCheck = await pool.query(
      'SELECT user_id FROM enrollments WHERE enrollment_id = $1',
      [idInt]
    );

    if (enrollmentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    if (userRole === 'murid' && enrollmentCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Cannot delete other user enrollments' });
    }

    await pool.query('DELETE FROM enrollments WHERE enrollment_id = $1', [idInt]);

    res.json({ message: 'Enrollment deleted successfully' });
  } catch (error) {
    console.error('Delete enrollment error:', error);
    res.status(500).json({ 
      error: 'Failed to delete enrollment',
      message: 'An error occurred while deleting the enrollment' 
    });
  }
});

export default router;
