import express from 'express';
import pool from '../config/database';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM hijaiyah ORDER BY ordinal');
    res.json({ letters: result.rows });
  } catch (error) {
    console.error('Get hijaiyah error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM hijaiyah WHERE hijaiyah_id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Letter not found' });
    }

    res.json({ letter: result.rows[0] });
  } catch (error) {
    console.error('Get hijaiyah error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', requireRole(['guru']), async (req: AuthRequest, res) => {
  try {
    const { latinName, arabicChar, ordinal } = req.body;

    if (!latinName || !arabicChar || ordinal === undefined) {
      return res.status(400).json({ error: 'latinName, arabicChar, and ordinal are required' });
    }

    const ordinalCheck = await pool.query(
      'SELECT hijaiyah_id FROM hijaiyah WHERE ordinal = $1',
      [ordinal]
    );

    if (ordinalCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Ordinal already exists' });
    }

    const result = await pool.query(
      'INSERT INTO hijaiyah (latin_name, arabic_char, ordinal) VALUES ($1, $2, $3) RETURNING *',
      [latinName, arabicChar, ordinal]
    );

    res.status(201).json({ letter: result.rows[0] });
  } catch (error) {
    console.error('Create hijaiyah error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', requireRole(['guru']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { latinName, arabicChar, ordinal } = req.body;

    const updates: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    if (latinName) {
      updates.push(`latin_name = $${paramCount}`);
      params.push(latinName);
      paramCount++;
    }

    if (arabicChar) {
      updates.push(`arabic_char = $${paramCount}`);
      params.push(arabicChar);
      paramCount++;
    }

    if (ordinal !== undefined) {
      const ordinalCheck = await pool.query(
        'SELECT hijaiyah_id FROM hijaiyah WHERE ordinal = $1 AND hijaiyah_id != $2',
        [ordinal, id]
      );

      if (ordinalCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Ordinal already exists' });
      }

      updates.push(`ordinal = $${paramCount}`);
      params.push(ordinal);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);
    const query = `UPDATE hijaiyah SET ${updates.join(', ')} WHERE hijaiyah_id = $${paramCount} RETURNING *`;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Letter not found' });
    }

    res.json({ letter: result.rows[0] });
  } catch (error) {
    console.error('Update hijaiyah error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', requireRole(['guru']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM hijaiyah WHERE hijaiyah_id = $1 RETURNING hijaiyah_id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Letter not found' });
    }

    res.json({ message: 'Letter deleted successfully' });
  } catch (error) {
    console.error('Delete hijaiyah error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
