import express from 'express';
import pool from '../config/database';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';

const router = express.Router();

router.use(authenticateToken);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (guru)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', requireRole(['guru']), async (req: AuthRequest, res) => {
  try {
    const { role, search, limit = '50', offset = '0' } = req.query;
    
    let query = 'SELECT user_id, name, email, role, created_at, is_verified FROM users WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (role) {
      query += ` AND role = $${paramCount}`;
      params.push(role);
      paramCount++;
    }

    if (search) {
      query += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    
    const countQuery = 'SELECT COUNT(*) FROM users WHERE 1=1' + 
      (role ? ' AND role = $1' : '') + 
      (search ? ` AND (name ILIKE $${role ? 2 : 1} OR email ILIKE $${role ? 2 : 1})` : '');
    const countParams = [role, search].filter(Boolean);
    const countResult = await pool.query(countQuery, countParams);

    res.json({ 
      users: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    if (userRole !== 'guru' && id !== String(userId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const result = await pool.query(
      'SELECT user_id, name, email, role, created_at, is_verified FROM users WHERE user_id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    if (userRole !== 'guru' && id !== String(userId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (userRole !== 'guru' && role) {
      return res.status(403).json({ error: 'Cannot change role' });
    }

    const updates: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    if (name) {
      updates.push(`name = $${paramCount}`);
      params.push(name);
      paramCount++;
    }

    if (email) {
      const emailCheck = await pool.query(
        'SELECT user_id FROM users WHERE email = $1 AND user_id != $2',
        [email, id]
      );
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      updates.push(`email = $${paramCount}`);
      params.push(email);
      paramCount++;
    }

    if (role && userRole === 'guru') {
      updates.push(`role = $${paramCount}`);
      params.push(role);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE user_id = $${paramCount} RETURNING user_id, name, email, role, created_at, is_verified`;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/users/{id}/password:
 *   put:
 *     summary: Change user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id/password', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.userId;

    if (id !== String(userId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const userResult = await pool.query('SELECT password FROM users WHERE user_id = $1', [id]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE user_id = $2', [hashedPassword, id]);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user (guru)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', requireRole(['guru']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM users WHERE user_id = $1 RETURNING user_id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
