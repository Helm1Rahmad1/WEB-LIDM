import express from 'express';
import pool from '../config/database';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

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

export default router;
