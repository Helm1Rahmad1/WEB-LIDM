import express from 'express';
import pool from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Send a new message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiver_id
 *               - message
 *             properties:
 *               receiver_id:
 *                 type: integer
 *                 description: ID of the message receiver
 *               message:
 *                 type: string
 *                 description: Message content
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Bad request - validation error
 */
router.post('/', async (req: AuthRequest, res) => {
    try {
        const senderId = req.user!.userId;
        const { receiver_id, message } = req.body;

        if (!receiver_id || !message) {
            return res.status(400).json({ error: 'receiver_id and message are required' });
        }

        // Validate that sender is not sending to themselves
        if (parseInt(senderId) === parseInt(receiver_id)) {
            return res.status(400).json({ error: 'Cannot send message to yourself' });
        }

        // Verify receiver exists
        const receiverCheck = await pool.query(
            'SELECT user_id FROM users WHERE user_id = $1',
            [receiver_id]
        );

        if (receiverCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Receiver not found' });
        }

        // Insert message
        const result = await pool.query(
            `INSERT INTO messages (sender_id, receiver_id, message, created_at, is_read)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, false)
       RETURNING *`,
            [senderId, receiver_id, message]
        );

        res.status(201).json({
            message: 'Message sent successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/messages:
 *   get:
 *     summary: Get conversation with a specific user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: conversation_with
 *         in: query
 *         required: true
 *         description: User ID to get conversation with
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 */
router.get('/', async (req: AuthRequest, res) => {
    try {
        const currentUserId = req.user!.userId;
        const { conversation_with } = req.query;

        if (!conversation_with) {
            return res.status(400).json({ error: 'conversation_with parameter is required' });
        }

        // Get all messages between current user and the other user
        const result = await pool.query(
            `SELECT m.*, 
              sender.name as sender_name, 
              sender.email as sender_email,
              receiver.name as receiver_name,
              receiver.email as receiver_email
       FROM messages m
       INNER JOIN users sender ON m.sender_id = sender.user_id
       INNER JOIN users receiver ON m.receiver_id = receiver.user_id
       WHERE (m.sender_id = $1 AND m.receiver_id = $2)
          OR (m.sender_id = $2 AND m.receiver_id = $1)
       ORDER BY m.created_at ASC`,
            [currentUserId, conversation_with]
        );

        res.json({
            messages: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/messages/conversations:
 *   get:
 *     summary: Get list of all conversations
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conversations retrieved successfully
 */
router.get('/conversations', async (req: AuthRequest, res) => {
    try {
        const currentUserId = req.user!.userId;

        // Get all users that current user has conversed with
        const result = await pool.query(
            `SELECT DISTINCT
         CASE 
           WHEN m.sender_id = $1 THEN m.receiver_id
           ELSE m.sender_id
         END as user_id,
         u.name,
         u.email,
         u.role,
         (SELECT message 
          FROM messages 
          WHERE (sender_id = $1 AND receiver_id = u.user_id) 
             OR (sender_id = u.user_id AND receiver_id = $1)
          ORDER BY created_at DESC 
          LIMIT 1) as last_message,
         (SELECT created_at 
          FROM messages 
          WHERE (sender_id = $1 AND receiver_id = u.user_id) 
             OR (sender_id = u.user_id AND receiver_id = $1)
          ORDER BY created_at DESC 
          LIMIT 1) as last_message_time,
         (SELECT COUNT(*) 
          FROM messages 
          WHERE sender_id = u.user_id 
            AND receiver_id = $1 
            AND is_read = false) as unread_count
       FROM messages m
       INNER JOIN users u ON (
         CASE 
           WHEN m.sender_id = $1 THEN m.receiver_id
           ELSE m.sender_id
         END = u.user_id
       )
       WHERE m.sender_id = $1 OR m.receiver_id = $1
       ORDER BY last_message_time DESC`,
            [currentUserId]
        );

        res.json({
            conversations: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/messages/{id}/read:
 *   put:
 *     summary: Mark a message as read
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Message ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Message marked as read
 *       403:
 *         description: Forbidden - only receiver can mark as read
 *       404:
 *         description: Message not found
 */
router.put('/:id/read', async (req: AuthRequest, res) => {
    try {
        const currentUserId = req.user!.userId;
        const { id } = req.params;

        // Check if message exists and current user is the receiver
        const checkResult = await pool.query(
            'SELECT * FROM messages WHERE message_id = $1',
            [id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Message not found' });
        }

        const message = checkResult.rows[0];

        if (parseInt(message.receiver_id) !== parseInt(currentUserId)) {
            return res.status(403).json({ error: 'Only receiver can mark message as read' });
        }

        // Update message
        const result = await pool.query(
            'UPDATE messages SET is_read = true WHERE message_id = $1 RETURNING *',
            [id]
        );

        res.json({
            message: 'Message marked as read',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Mark message as read error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/messages/unread-count:
 *   get:
 *     summary: Get count of unread messages
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count retrieved successfully
 */
router.get('/unread-count', async (req: AuthRequest, res) => {
    try {
        const currentUserId = req.user!.userId;

        const result = await pool.query(
            'SELECT COUNT(*) as unread_count FROM messages WHERE receiver_id = $1 AND is_read = false',
            [currentUserId]
        );

        res.json({
            unread_count: parseInt(result.rows[0].unread_count) || 0
        });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/messages/mark-conversation-read:
 *   put:
 *     summary: Mark all messages in a conversation as read
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sender_id
 *             properties:
 *               sender_id:
 *                 type: integer
 *                 description: ID of the sender whose messages to mark as read
 *     responses:
 *       200:
 *         description: Messages marked as read
 */
router.put('/mark-conversation-read', async (req: AuthRequest, res) => {
    try {
        const currentUserId = req.user!.userId;
        const { sender_id } = req.body;

        if (!sender_id) {
            return res.status(400).json({ error: 'sender_id is required' });
        }

        // Mark all messages from sender_id to current user as read
        const result = await pool.query(
            `UPDATE messages 
       SET is_read = true 
       WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false
       RETURNING *`,
            [sender_id, currentUserId]
        );

        res.json({
            message: 'Conversation marked as read',
            updated_count: result.rows.length
        });
    } catch (error) {
        console.error('Mark conversation as read error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
