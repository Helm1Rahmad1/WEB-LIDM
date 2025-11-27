import express from 'express';
import pool from '../config/database';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);




/**
 * @swagger
 * /api/jilid-letters:
 *   post:
 *     summary: Add letter to jilid (guru)
 *     tags: [Jilid]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', requireRole(['guru']), async (req: AuthRequest, res) => {
  try {
    const { jilidId, hijaiyahId, sortOrder } = req.body;

    if (!jilidId || !hijaiyahId) {
      return res.status(400).json({ error: 'jilidId and hijaiyahId are required' });
    }

    const jilidCheck = await pool.query('SELECT jilid_id FROM jilid WHERE jilid_id = $1', [jilidId]);
    if (jilidCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Jilid not found' });
    }

    const hijaiyahCheck = await pool.query('SELECT hijaiyah_id FROM hijaiyah WHERE hijaiyah_id = $1', [hijaiyahId]);
    if (hijaiyahCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Hijaiyah not found' });
    }

    const existingCheck = await pool.query(
      'SELECT id FROM jilid_letters WHERE jilid_id = $1 AND hijaiyah_id = $2',
      [jilidId, hijaiyahId]
    );

    if (existingCheck.rows.length > 0) {
      return res.status(400).json({ error: 'This letter already exists in the jilid' });
    }

    const result = await pool.query(
      'INSERT INTO jilid_letters (jilid_id, hijaiyah_id, sort_order) VALUES ($1, $2, $3) RETURNING *',
      [jilidId, hijaiyahId, sortOrder || 1]
    );

    res.status(201).json({ jilidLetter: result.rows[0] });
  } catch (error) {
    console.error('Create jilid letter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/jilid-letters/{id}:
 *   put:
 *     summary: Update jilid letter (guru)
 *     tags: [Jilid]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', requireRole(['guru']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { jilidId, hijaiyahId, sortOrder } = req.body;

    const updates: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    if (jilidId) {
      const jilidCheck = await pool.query('SELECT jilid_id FROM jilid WHERE jilid_id = $1', [jilidId]);
      if (jilidCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Jilid not found' });
      }
      updates.push(`jilid_id = $${paramCount}`);
      params.push(jilidId);
      paramCount++;
    }

    if (hijaiyahId) {
      const hijaiyahCheck = await pool.query('SELECT hijaiyah_id FROM hijaiyah WHERE hijaiyah_id = $1', [hijaiyahId]);
      if (hijaiyahCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Hijaiyah not found' });
      }
      updates.push(`hijaiyah_id = $${paramCount}`);
      params.push(hijaiyahId);
      paramCount++;
    }

    if (sortOrder !== undefined) {
      updates.push(`sort_order = $${paramCount}`);
      params.push(sortOrder);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);
    const query = `UPDATE jilid_letters SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Jilid letter not found' });
    }

    res.json({ jilidLetter: result.rows[0] });
  } catch (error) {
    console.error('Update jilid letter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



export default router;
