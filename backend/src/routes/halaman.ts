import express from 'express';
import pool from '../config/database';

const router = express.Router();

/**
 * @swagger
 * /api/halaman:
 *   get:
 *     summary: Get all halaman (pages) in a jilid
 *     description: Get list of all halaman in a specific jilid. This is an alias for /api/pages endpoint.
 *     tags: [Halaman]
 *     parameters:
 *       - name: jilidId
 *         in: query
 *         required: true
 *         description: ID of the jilid
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of halaman in the jilid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 halaman:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       jilid_id:
 *                         type: integer
 *                       nomor_halaman:
 *                         type: integer
 *                       halaman_id:
 *                         type: string
 *                       deskripsi:
 *                         type: string
 *       400:
 *         description: Missing jilidId parameter
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
  try {
    const { jilidId } = req.query;

    console.log('📄 GET /api/halaman - jilidId:', jilidId);

    if (!jilidId) {
      return res.status(400).json({ 
        error: 'jilidId parameter is required' 
      });
    }

    const jilidIdNum = Number(jilidId);
    if (isNaN(jilidIdNum)) {
      return res.status(400).json({ 
        error: 'jilidId must be a valid number' 
      });
    }

    const result = await pool.query(
      `SELECT jilid_id, nomor_halaman, halaman_id, deskripsi
       FROM halaman
       WHERE jilid_id = $1
       ORDER BY nomor_halaman`,
      [jilidIdNum]
    );

    console.log(`✅ Found ${result.rows.length} halaman for jilid ${jilidIdNum}`);
    res.json({ halaman: result.rows });
  } catch (error) {
    console.error('❌ Get halaman error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
