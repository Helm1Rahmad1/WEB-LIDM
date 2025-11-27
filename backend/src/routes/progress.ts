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
    const { targetUserId } = req.query;

    // Based on your current table structure, user_letter_progress only has progress_id, user_id, hijaiyah_id, last_update
    // The API was previously designed to work with a table that had room_id and status, but your current table doesn't have these
    let query = `
      SELECT ulp.progress_id, ulp.user_id, ulp.hijaiyah_id, ulp.last_update, h.latin_name, h.arabic_char, u.name as user_name
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
      `SELECT ulp.progress_id, ulp.user_id, ulp.hijaiyah_id, ulp.last_update, h.latin_name, h.arabic_char, u.name as user_name
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
 * /api/progress/letter:
 *   post:
 *     summary: Update letter progress (using current table structure)
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 */
router.post('/letter', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { hijaiyahId } = req.body;

    if (!hijaiyahId) {
      return res.status(400).json({ error: 'hijaiyahId is required' });
    }

    // Insert or update using only existing columns in current table
    const result = await pool.query(
      `INSERT INTO user_letter_progress (user_id, hijaiyah_id, last_update)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, hijaiyah_id) 
       DO UPDATE SET last_update = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, hijaiyahId]
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
 *     summary: Update letter progress (using current table structure)
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 */
router.put('/letter/:id', requireRole(['guru']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE user_letter_progress SET last_update = CURRENT_TIMESTAMP WHERE progress_id = $1 RETURNING *',
      [id]
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
    const { targetUserId } = req.query;

    // Try to select all columns but handle the case where some might not exist
    let query = `
      SELECT uhp.user_halaman_id, uhp.user_id, uhp.halaman_id, uhp.status, uhp.last_update, h.jilid_id, h.nomor_halaman, u.name as user_name
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
      `SELECT uhp.user_halaman_id, uhp.user_id, uhp.halaman_id, uhp.status, uhp.last_update, h.jilid_id, h.nomor_halaman, u.name as user_name
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
 *     summary: Get all halaman progress for a jilid
 *     description: Get progress status for all pages in a jilid. Guru can specify targetUserId to view other users' progress.
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: jilidId
 *         in: path
 *         required: true
 *         description: ID of the jilid
 *         schema:
 *           type: integer
 *       - name: targetUserId
 *         in: query
 *         required: false
 *         description: User ID to view progress for (guru only)
 *         schema:
 *           type: integer
 */
router.get('/halaman/by-jilid/:jilidId', async (req: AuthRequest, res) => {
  try {
    const { jilidId } = req.params;
    const currentUserId = req.user!.userId;
    const userRole = req.user!.role;
    const { targetUserId } = req.query;

    // Determine which user's progress to fetch
    let fetchUserId = currentUserId;
    
    if (userRole === 'guru' && targetUserId) {
      // Guru can view other users' progress
      fetchUserId = targetUserId as string;
    } else if (userRole === 'murid' && targetUserId && targetUserId !== currentUserId) {
      // Murid cannot view other users' progress
      return res.status(403).json({ error: 'Forbidden: Cannot view other users\' progress' });
    }

    console.log(`📊 Fetching halaman progress for user ${fetchUserId}, jilid ${jilidId}`);

    const result = await pool.query(
      `SELECT uhp.halaman_id, uhp.status, uhp.last_update, h.nomor_halaman, h.jilid_id
       FROM user_halaman_progress uhp
       LEFT JOIN halaman h ON CAST(h.halaman_id AS TEXT) = uhp.halaman_id
       WHERE uhp.user_id = $1 AND h.jilid_id = $2
       ORDER BY h.nomor_halaman`,
      [fetchUserId, jilidId]
    );

    console.log(`✅ Found ${result.rows.length} halaman progress records for user ${fetchUserId}, jilid ${jilidId}`);

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
      `SELECT uhp.user_halaman_id, uhp.user_id, uhp.halaman_id, uhp.status, uhp.last_update, h.jilid_id, h.nomor_halaman
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

    if (!halamanId) {
      return res.status(400).json({ error: 'halamanId is required' });
    }

    const result = await pool.query(
      `INSERT INTO user_halaman_progress (user_id, halaman_id, status)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, halaman_id)
       DO UPDATE SET status = $3, last_update = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, halamanId, status || 0] // Default status to 0 if not provided
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

/**
 * @swagger
 * /api/progress/jilid:
 *   get:
 *     summary: Get jilid progress for a user
 *     description: Get progress status for all jilid for a specific user (guru can view other users' progress)
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: targetUserId
 *         in: query
 *         required: false
 *         description: User ID to view progress for (guru only)
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Jilid progress data for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 progress:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: integer
 *                         description: User ID
 *                       jilid_id:
 *                         type: integer
 *                         description: Jilid ID
 *                       jilid_name:
 *                         type: string
 *                         description: Name of the jilid
 *                       total_jilid_pages:
 *                         type: integer
 *                         description: Total number of pages in this jilid
 *                       total_halaman_selesai:
 *                         type: integer
 *                         description: Number of completed pages
 *                       progress_percentage:
 *                         type: number
 *                         description: Progress percentage (0-100)
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Internal server error
 */
router.get('/jilid', async (req: AuthRequest, res) => {
  try {
    const currentUserId = req.user!.userId;
    const userRole = req.user!.role;
    const { targetUserId } = req.query;

    // Determine which user's progress to fetch
    let fetchUserId = currentUserId;

    if (userRole === 'guru' && targetUserId) {
      // Guru can view other users' progress
      fetchUserId = targetUserId as string;
    } else if (userRole === 'murid' && targetUserId && targetUserId !== currentUserId) {
      // Murid cannot view other users' progress
      return res.status(403).json({ error: 'Forbidden: Cannot view other users\' progress' });
    }

    console.log(`📊 Fetching jilid progress for user ${fetchUserId}`);

    // Query to get total pages per jilid
    const totalPagesQuery = `
      SELECT 
        j.jilid_id,
        j.jilid_name,
        COUNT(h.halaman_id) AS total_pages
      FROM jilid j
      LEFT JOIN halaman h ON j.jilid_id = h.jilid_id
      GROUP BY j.jilid_id, j.jilid_name
      ORDER BY j.jilid_id
    `;
    
    const totalPagesResult = await pool.query(totalPagesQuery);
    const jilidInfo = totalPagesResult.rows;

    // Query to get completed pages per jilid for the user
    const completedPagesQuery = `
      SELECT
        uhp.user_id,
        j.jilid_id,
        j.jilid_name,
        COUNT(DISTINCT uhp.halaman_id) AS total_halaman_selesai
      FROM user_halaman_progress uhp
      JOIN halaman h ON h.halaman_id = uhp.halaman_id
      JOIN jilid j ON j.jilid_id = h.jilid_id
      WHERE uhp.user_id = $1 AND uhp.status = 1
      GROUP BY uhp.user_id, j.jilid_id, j.jilid_name
      ORDER BY j.jilid_id
    `;
    
    const completedPagesResult = await pool.query(completedPagesQuery, [fetchUserId]);
    const completedProgress = completedPagesResult.rows;

    // Combine the data to calculate progress percentage
    const jilidProgressData = jilidInfo.map(jilid => {
      const completedData = completedProgress.find(data => data.jilid_id === jilid.jilid_id);
      const totalHalamanSelesai = completedData ? completedData.total_halaman_selesai : 0;
      const totalJilidPages = parseInt(jilid.total_pages) || 0;
      
      const progressPercentage = totalJilidPages > 0 
        ? Math.round((totalHalamanSelesai / totalJilidPages) * 100) 
        : 0;

      return {
        user_id: parseInt(fetchUserId),
        jilid_id: jilid.jilid_id,
        jilid_name: jilid.jilid_name,
        total_jilid_pages: totalJilidPages,
        total_halaman_selesai: totalHalamanSelesai,
        progress_percentage: progressPercentage
      };
    });

    console.log(`✅ Found progress for ${jilidProgressData.length} jilid(s) for user ${fetchUserId}`);
    res.json({ progress: jilidProgressData });
  } catch (error) {
    console.error('Get jilid progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/progress/jilid/{jilidId}:
 *   get:
 *     summary: Get progress for a specific jilid
 *     description: Get progress status for a specific jilid for the current user (guru can view other users' progress)
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: jilidId
 *         in: path
 *         required: true
 *         description: ID of the jilid
 *         schema:
 *           type: integer
 *       - name: targetUserId
 *         in: query
 *         required: false
 *         description: User ID to view progress for (guru only)
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Jilid progress data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 progress:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: integer
 *                       description: User ID
 *                     jilid_id:
 *                       type: integer
 *                       description: Jilid ID
 *                     jilid_name:
 *                       type: string
 *                       description: Name of the jilid
 *                     total_jilid_pages:
 *                       type: integer
 *                       description: Total number of pages in this jilid
 *                     total_halaman_selesai:
 *                       type: integer
 *                       description: Number of completed pages
 *                     progress_percentage:
 *                       type: number
 *                       description: Progress percentage (0-100)
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Internal server error
 */
router.get('/jilid/:jilidId', async (req: AuthRequest, res) => {
  try {
    const { jilidId } = req.params;
    const currentUserId = req.user!.userId;
    const userRole = req.user!.role;
    const { targetUserId } = req.query;

    // Determine which user's progress to fetch
    let fetchUserId = currentUserId;

    if (userRole === 'guru' && targetUserId) {
      // Guru can view other users' progress
      fetchUserId = targetUserId as string;
    } else if (userRole === 'murid' && targetUserId && targetUserId !== currentUserId) {
      // Murid cannot view other users' progress
      return res.status(403).json({ error: 'Forbidden: Cannot view other users\' progress' });
    }

    console.log(`📊 Fetching progress for user ${fetchUserId} in jilid ${jilidId}`);

    // Query to get total pages in the specified jilid
    const totalPagesQuery = `
      SELECT 
        j.jilid_id,
        j.jilid_name,
        COUNT(h.halaman_id) AS total_pages
      FROM jilid j
      LEFT JOIN halaman h ON j.jilid_id = h.jilid_id
      WHERE j.jilid_id = $1
      GROUP BY j.jilid_id, j.jilid_name
    `;
    
    const totalPagesResult = await pool.query(totalPagesQuery, [jilidId]);
    
    if (totalPagesResult.rows.length === 0) {
      return res.status(404).json({ error: 'Jilid not found' });
    }
    
    const jilidInfo = totalPagesResult.rows[0];
    const totalJilidPages = parseInt(jilidInfo.total_pages) || 0;

    // Query to get completed pages in this jilid for the user
    const completedPagesQuery = `
      SELECT
        uhp.user_id,
        j.jilid_id,
        j.jilid_name,
        COUNT(DISTINCT uhp.halaman_id) AS total_halaman_selesai
      FROM user_halaman_progress uhp
      JOIN halaman h ON h.halaman_id = uhp.halaman_id
      JOIN jilid j ON j.jilid_id = h.jilid_id
      WHERE uhp.user_id = $1 AND j.jilid_id = $2 AND uhp.status = 1
      GROUP BY uhp.user_id, j.jilid_id, j.jilid_name
    `;
    
    const completedPagesResult = await pool.query(completedPagesQuery, [fetchUserId, jilidId]);
    const totalHalamanSelesai = completedPagesResult.rows.length > 0 
      ? completedPagesResult.rows[0].total_halaman_selesai 
      : 0;
    
    const progressPercentage = totalJilidPages > 0 
      ? Math.round((totalHalamanSelesai / totalJilidPages) * 100) 
      : 0;

    const progressData = {
      user_id: parseInt(fetchUserId),
      jilid_id: jilidInfo.jilid_id,
      jilid_name: jilidInfo.jilid_name,
      total_jilid_pages: totalJilidPages,
      total_halaman_selesai: totalHalamanSelesai,
      progress_percentage: progressPercentage
    };

    console.log(`✅ Progress for user ${fetchUserId} in jilid ${jilidId}: ${totalHalamanSelesai}/${totalJilidPages} pages (${progressPercentage}%)`);
    res.json({ progress: progressData });
  } catch (error) {
    console.error('Get specific jilid progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
