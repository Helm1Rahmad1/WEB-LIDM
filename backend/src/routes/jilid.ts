import express from 'express';
import pool from '../config/database';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

/**
 * @swagger
 * /api/jilid:
 *   get:
 *     summary: Get all jilid
 *     tags: [Jilid]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM jilid ORDER BY jilid_id');
    res.json({ jilid: result.rows });
  } catch (error) {
    console.error('Get jilid error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/jilid/{id}:
 *   get:
 *     summary: Get jilid by ID
 *     tags: [Jilid]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM jilid WHERE jilid_id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Jilid not found' });
    }

    res.json({ jilid: result.rows[0] });
  } catch (error) {
    console.error('Get jilid error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/jilid/{id}/letters:
 *   get:
 *     summary: Get letters in jilid
 *     tags: [Jilid]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id/letters', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT h.*, jl.sort_order 
       FROM hijaiyah h
       INNER JOIN jilid_letters jl ON h.hijaiyah_id = jl.hijaiyah_id
       WHERE jl.jilid_id = $1
       ORDER BY jl.sort_order`,
      [id]
    );

    res.json({ letters: result.rows });
  } catch (error) {
    console.error('Get jilid letters error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/jilid:
 *   post:
 *     summary: Create new jilid (guru)
 *     tags: [Jilid]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', requireRole(['guru']), async (req: AuthRequest, res) => {
  try {
    const { jilidName, description } = req.body;

    if (!jilidName) {
      return res.status(400).json({ error: 'jilidName is required' });
    }

    const result = await pool.query(
      'INSERT INTO jilid (jilid_name, description) VALUES ($1, $2) RETURNING *',
      [jilidName, description || null]
    );

    res.status(201).json({ jilid: result.rows[0] });
  } catch (error) {
    console.error('Create jilid error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/jilid/{id}:
 *   put:
 *     summary: Update jilid (guru)
 *     tags: [Jilid]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', requireRole(['guru']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { jilidName, description } = req.body;

    const updates: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    if (jilidName) {
      updates.push(`jilid_name = $${paramCount}`);
      params.push(jilidName);
      paramCount++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      params.push(description);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);
    const query = `UPDATE jilid SET ${updates.join(', ')} WHERE jilid_id = $${paramCount} RETURNING *`;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Jilid not found' });
    }

    res.json({ jilid: result.rows[0] });
  } catch (error) {
    console.error('Update jilid error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/jilid/{id}:
 *   delete:
 *     summary: Delete jilid (guru)
 *     tags: [Jilid]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', requireRole(['guru']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM jilid WHERE jilid_id = $1 RETURNING jilid_id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Jilid not found' });
    }

    res.json({ message: 'Jilid deleted successfully' });
  } catch (error) {
    console.error('Delete jilid error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
