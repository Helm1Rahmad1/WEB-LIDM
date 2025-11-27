import express from 'express';
import pool from '../config/database';

const router = express.Router();

/**
 * @swagger
 * /api/pages:
 *   get:
 *     summary: Get all pages in a jilid
 *     description: Get list of all pages (halaman) in a specific jilid
 *     tags: [Pages]
 *     parameters:
 *       - name: jilidId
 *         in: query
 *         required: true
 *         description: ID of the jilid
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of pages in the jilid
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

    console.log('📄 GET /api/pages - jilidId:', jilidId);

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

    console.log(`✅ Found ${result.rows.length} pages for jilid ${jilidIdNum}`);
    res.json({ halaman: result.rows });
  } catch (error) {
    console.error('❌ Get pages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/pages/detail:
 *   get:
 *     summary: Get detailed page information with hijaiyah letters
 *     description: Get detailed information about a specific page in a jilid, including all hijaiyah letters on that page with their positions
 *     tags: [Pages]
 *     parameters:
 *       - name: jilid_id
 *         in: query
 *         required: true
 *         description: ID of the jilid
 *         schema:
 *           type: integer
 *       - name: nomor_halaman
 *         in: query
 *         required: true
 *         description: Page number
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Page details with hijaiyah letters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pageDetail:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       jilid_id:
 *                         type: integer
 *                         description: ID of the jilid
 *                       jilid_name:
 *                         type: string
 *                         description: Name of the jilid
 *                       halaman_id:
 *                         type: integer
 *                         description: ID of the page
 *                       nomor_halaman:
 *                         type: integer
 *                         description: Page number
 *                       hijaiyah_halaman_id:
 *                         type: integer
 *                         description: ID of the hijaiyah-halaman relationship
 *                       hijaiyah_id:
 *                         type: integer
 *                         description: ID of the hijaiyah letter
 *                       latin_name:
 *                         type: string
 *                         description: Latin name of the hijaiyah letter
 *                       arabic_char:
 *                         type: string
 *                         description: Arabic character of the hijaiyah letter
 *                       baris:
 *                         type: integer
 *                         description: Row position of the letter in the page
 *                       urutan:
 *                         type: integer
 *                         description: Sequence order of the letter in the row
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Internal server error
 */
router.get('/detail', async (req, res) => {
  try {
    const { jilid_id, nomor_halaman } = req.query;

    // Validate required parameters
    if (!jilid_id || !nomor_halaman) {
      return res.status(400).json({ 
        error: 'Both jilid_id and nomor_halaman parameters are required' 
      });
    }

    // Convert to numbers
    const jilidId = Number(jilid_id);
    const nomorHalaman = Number(nomor_halaman);

    if (isNaN(jilidId) || isNaN(nomorHalaman)) {
      return res.status(400).json({ 
        error: 'jilid_id and nomor_halaman must be valid numbers' 
      });
    }

    // Execute the query to get page details with hijaiyah letters
    const result = await pool.query(
      `SELECT 
        j.jilid_id,
        j.jilid_name,
        h.halaman_id,
        h.nomor_halaman,
        hlh.id AS hijaiyah_halaman_id,
        hlh.hijaiyah_id,
        hj.latin_name,
        hj.arabic_char,
        hlh.baris,
        hlh.urutan
      FROM jilid j
      JOIN halaman h 
        ON h.jilid_id = j.jilid_id
      JOIN hijaiyah_letter_halaman hlh 
        ON hlh.halaman_id = h.halaman_id
      JOIN hijaiyah hj 
        ON hj.hijaiyah_id = hlh.hijaiyah_id
      WHERE j.jilid_id = $1
        AND h.nomor_halaman = $2
      ORDER BY hlh.baris, hlh.urutan`,
      [jilidId, nomorHalaman]
    );

    // Check if any results were found
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        message: 'No data found for the specified jilid_id and nomor_halaman' 
      });
    }

    res.json({ pageDetail: result.rows });
  } catch (error) {
    console.error('Get page detail error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;