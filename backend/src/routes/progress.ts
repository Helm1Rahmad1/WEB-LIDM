import express from 'express';
import pool from '../config/database';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

/**
 * @swagger
 * /api/progress/letter:
 *   get:
 *     summary: Get letter progress
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 */
router.get('/letter', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const { roomId, targetUserId, status } = req.query;

    let query = `
      SELECT ulp.*, h.latin_name, h.arabic_char, u.name as user_name
      FROM user_letter_progress ulp
      INNER JOIN hijaiyah h ON ulp.hijaiyah_id = h.hijaiyah_id
      INNER JOIN users u ON ulp.user_id = u.user_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (userRole === 'murid') {
      query += ` AND ulp.user_id = $${paramCount}`;
      params.push(userId);
      paramCount++;
    } else if (targetUserId) {
      query += ` AND ulp.user_id = $${paramCount}`;
      params.push(targetUserId);
      paramCount++;
    }

    if (roomId) {
      query += ` AND ulp.room_id = $${paramCount}`;
      params.push(roomId);
      paramCount++;
    }

    if (status) {
      query += ` AND ulp.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    query += ' ORDER BY h.ordinal';

    const result = await pool.query(query, params);
    res.json({ progress: result.rows });
  } catch (error) {
    console.error('Get letter progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/progress/letter/{id}:
 *   get:
 *     summary: Get letter progress by ID
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 */
router.get('/letter/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const result = await pool.query(
      `SELECT ulp.*, h.latin_name, h.arabic_char, u.name as user_name
       FROM user_letter_progress ulp
       INNER JOIN hijaiyah h ON ulp.hijaiyah_id = h.hijaiyah_id
       INNER JOIN users u ON ulp.user_id = u.user_id
       WHERE ulp.progress_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Letter progress not found' });
    }

    const progress = result.rows[0];

    if (userRole === 'murid' && progress.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ progress: progress });
  } catch (error) {
    console.error('Get letter progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/progress/jilid:
 *   get:
 *     summary: Get jilid progress
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 */
router.get('/jilid', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const { roomId, targetUserId, status } = req.query;

    let query = `
      SELECT ujp.*, j.jilid_name, j.description, u.name as user_name
      FROM user_jilid_progress ujp
      INNER JOIN jilid j ON ujp.jilid_id = j.jilid_id
      INNER JOIN users u ON ujp.user_id = u.user_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (userRole === 'murid') {
      query += ` AND ujp.user_id = $${paramCount}`;
      params.push(userId);
      paramCount++;
    } else if (targetUserId) {
      query += ` AND ujp.user_id = $${paramCount}`;
      params.push(targetUserId);
      paramCount++;
    }

    if (roomId) {
      query += ` AND ujp.room_id = $${paramCount}`;
      params.push(roomId);
      paramCount++;
    }

    if (status) {
      query += ` AND ujp.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    query += ' ORDER BY j.jilid_id';

    const result = await pool.query(query, params);
    res.json({ progress: result.rows });
  } catch (error) {
    console.error('Get jilid progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/progress/jilid/{id}:
 *   get:
 *     summary: Get jilid progress by ID
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 */
router.get('/jilid/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const result = await pool.query(
      `SELECT ujp.*, j.jilid_name, j.description, u.name as user_name
       FROM user_jilid_progress ujp
       INNER JOIN jilid j ON ujp.jilid_id = j.jilid_id
       INNER JOIN users u ON ujp.user_id = u.user_id
       WHERE ujp.user_jilid_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Jilid progress not found' });
    }

    const progress = result.rows[0];

    if (userRole === 'murid' && progress.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ progress: progress });
  } catch (error) {
    console.error('Get jilid progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/progress/letter:
 *   post:
 *     summary: Update letter progress
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 */
router.post('/letter', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { roomId, hijaiyahId, status } = req.body;

    if (!roomId || !hijaiyahId || !status) {
      return res.status(400).json({ error: 'roomId, hijaiyahId, and status are required' });
    }

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

/**
 * @swagger
 * /api/progress/letter/{id}:
 *   put:
 *     summary: Update letter progress status (guru)
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 */
router.put('/letter/:id', requireRole(['guru']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }

    const result = await pool.query(
      'UPDATE user_letter_progress SET status = $1, last_update = CURRENT_TIMESTAMP WHERE progress_id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Letter progress not found' });
    }

    res.json({ progress: result.rows[0] });
  } catch (error) {
    console.error('Update letter progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/progress/letter/{id}:
 *   delete:
 *     summary: Delete letter progress (guru)
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/letter/:id', requireRole(['guru']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM user_letter_progress WHERE progress_id = $1 RETURNING progress_id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Letter progress not found' });
    }

    res.json({ message: 'Letter progress deleted successfully' });
  } catch (error) {
    console.error('Delete letter progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/progress/jilid:
 *   post:
 *     summary: Update jilid progress
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 */
router.post('/jilid', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { roomId, jilidId, status } = req.body;

    if (!roomId || !jilidId || !status) {
      return res.status(400).json({ error: 'roomId, jilidId, and status are required' });
    }

    const result = await pool.query(
      `INSERT INTO user_jilid_progress (user_id, room_id, jilid_id, status)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, room_id, jilid_id) 
       DO UPDATE SET status = $4, last_update = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, roomId, jilidId, status]
    );

    res.json({ progress: result.rows[0] });
  } catch (error) {
    console.error('Update jilid progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/progress/jilid/{id}:
 *   put:
 *     summary: Update jilid progress status (guru)
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 */
router.put('/jilid/:id', requireRole(['guru']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }

    const result = await pool.query(
      'UPDATE user_jilid_progress SET status = $1, last_update = CURRENT_TIMESTAMP WHERE user_jilid_id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Jilid progress not found' });
    }

    res.json({ progress: result.rows[0] });
  } catch (error) {
    console.error('Update jilid progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/progress/jilid/{id}:
 *   delete:
 *     summary: Delete jilid progress (guru)
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/jilid/:id', requireRole(['guru']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM user_jilid_progress WHERE user_jilid_id = $1 RETURNING user_jilid_id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Jilid progress not found' });
    }

    res.json({ message: 'Jilid progress deleted successfully' });
  } catch (error) {
    console.error('Delete jilid progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/progress/halaman:
 *   get:
 *     summary: Get halaman (page) progress
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 */
router.get('/halaman', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const { targetUserId, status } = req.query;

    let query = `
      SELECT uhp.*, h.jilid_id, h.nomor_halaman, u.name as user_name
      FROM user_halaman_progress uhp
      LEFT JOIN halaman h ON CAST(h.halaman_id AS TEXT) = uhp.halaman_id
      INNER JOIN users u ON uhp.user_id = u.user_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (userRole === 'murid') {
      query += ` AND uhp.user_id = $${paramCount}`;
      params.push(userId);
      paramCount++;
    } else if (targetUserId) {
      query += ` AND uhp.user_id = $${paramCount}`;
      params.push(targetUserId);
      paramCount++;
    }

    if (status) {
      query += ` AND uhp.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    query += ' ORDER BY uhp.last_update DESC';

    const result = await pool.query(query, params);
    res.json({ progress: result.rows });
  } catch (error) {
    console.error('Get halaman progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/progress/halaman/{id}:
 *   get:
 *     summary: Get halaman progress by ID
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 */
router.get('/halaman/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const result = await pool.query(
      `SELECT uhp.*, h.jilid_id, h.nomor_halaman, u.name as user_name
       FROM user_halaman_progress uhp
       LEFT JOIN halaman h ON CAST(h.halaman_id AS TEXT) = uhp.halaman_id
       INNER JOIN users u ON uhp.user_id = u.user_id
       WHERE uhp.user_halaman_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Halaman progress not found' });
    }

    const progress = result.rows[0];

    if (userRole === 'murid' && progress.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ progress: progress });
  } catch (error) {
    console.error('Get halaman progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/progress/halaman/by-jilid/{jilidId}:
 *   get:
 *     summary: Get all halaman progress for a jilid for current user
 *     description: Get progress status for all pages in a jilid
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 */
router.get('/halaman/by-jilid/:jilidId', async (req: AuthRequest, res) => {
  try {
    const { jilidId } = req.params;
    const userId = req.user!.userId;

    const result = await pool.query(
      `SELECT uhp.halaman_id, uhp.status, uhp.last_update, h.nomor_halaman
       FROM user_halaman_progress uhp
       LEFT JOIN halaman h ON CAST(h.halaman_id AS TEXT) = uhp.halaman_id
       WHERE uhp.user_id = $1 AND h.jilid_id = $2
       ORDER BY h.nomor_halaman`,
      [userId, jilidId]
    );

    res.json({ progress: result.rows });
  } catch (error) {
    console.error('Get halaman progress by jilid error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/progress/halaman/by-page/{halamanId}:
 *   get:
 *     summary: Get halaman progress by halaman_id for current user
 *     description: Check if current user has completed a specific page
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: halamanId
 *         in: path
 *         required: true
 *         description: ID of the page (e.g., "1-1")
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Progress found
 *       404:
 *         description: No progress found for this page
 */
router.get('/halaman/by-page/:halamanId', async (req: AuthRequest, res) => {
  try {
    const { halamanId } = req.params;
    const userId = req.user!.userId;

    const result = await pool.query(
      `SELECT uhp.*, h.jilid_id, h.nomor_halaman
       FROM user_halaman_progress uhp
       LEFT JOIN halaman h ON CAST(h.halaman_id AS TEXT) = uhp.halaman_id
       WHERE uhp.user_id = $1 AND uhp.halaman_id = $2`,
      [userId, halamanId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        message: 'No progress found for this page',
        completed: false 
      });
    }

    const progress = result.rows[0];
    res.json({ 
      progress: progress,
      completed: progress.status > 0 
    });
  } catch (error) {
    console.error('Get halaman progress by page error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/progress/halaman:
 *   post:
 *     summary: Create or update halaman progress for the current user
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 */
router.post('/halaman', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { halamanId, status } = req.body;

    if (!halamanId || status === undefined) {
      return res.status(400).json({ error: 'halamanId and status are required' });
    }

    const result = await pool.query(
      `INSERT INTO user_halaman_progress (user_id, halaman_id, status)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, halaman_id)
       DO UPDATE SET status = $3, last_update = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, halamanId, status]
    );

    res.json({ progress: result.rows[0] });
  } catch (error) {
    console.error('Update halaman progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/progress/halaman/{id}:
 *   put:
 *     summary: Update halaman progress status (guru)
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 */
router.put('/halaman/:id', requireRole(['guru']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status === undefined) {
      return res.status(400).json({ error: 'status is required' });
    }

    const result = await pool.query(
      'UPDATE user_halaman_progress SET status = $1, last_update = CURRENT_TIMESTAMP WHERE user_halaman_id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Halaman progress not found' });
    }

    res.json({ progress: result.rows[0] });
  } catch (error) {
    console.error('Update halaman progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/progress/halaman/{id}:
 *   delete:
 *     summary: Delete halaman progress (guru)
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/halaman/:id', requireRole(['guru']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM user_halaman_progress WHERE user_halaman_id = $1 RETURNING user_halaman_id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Halaman progress not found' });
    }

    res.json({ message: 'Halaman progress deleted successfully' });
  } catch (error) {
    console.error('Delete halaman progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
