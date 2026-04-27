import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { authMiddleware } from '../middleware';

const router = Router();
router.use(authMiddleware);

// POST /api/notifications/send
// Body: { title, body, type, school_ids[], competition_id?, scheduled_for? }
router.post('/send', async (req: Request, res: Response) => {
  try {
    const { title, body, type, school_ids, competition_id, scheduled_for } = req.body;

    if (!title || !body || !type) {
      res.status(400).json({ message: 'title, body, and type are required' });
      return;
    }
    if (!Array.isArray(school_ids) || school_ids.length === 0) {
      res.status(400).json({ message: 'school_ids must be a non-empty array' });
      return;
    }

    // Get all user IDs from the target schools
    const usersResult = await pool.query(
      `SELECT id FROM users WHERE school_id = ANY($1::uuid[])`,
      [school_ids]
    );

    if (usersResult.rows.length === 0) {
      res.json({ sent: 0, message: 'No users found in selected schools' });
      return;
    }

    const userIds: string[] = usersResult.rows.map((r) => r.id);

    // Build data JSON
    const data: Record<string, unknown> = { type };
    if (competition_id) data.competition_id = competition_id;

    // Bulk INSERT — one row per user
    const placeholders = userIds
      .map((_, idx) => {
        const b = idx * 6;
        return `($${b+1}, $${b+2}, $${b+3}, $${b+4}, $${b+5}, $${b+6})`;
      })
      .join(', ');

    const values: unknown[] = [];
    for (const uid of userIds) {
      values.push(uid, type, title, body, JSON.stringify(data), scheduled_for || null);
    }

    await pool.query(
      `INSERT INTO notifications (user_id, type, title, body, data, scheduled_for)
       VALUES ${placeholders}`,
      values
    );

    res.json({
      sent: userIds.length,
      schools: school_ids.length,
      message: `Sent to ${userIds.length} users across ${school_ids.length} school(s)`,
    });
  } catch (err) {
    console.error('Send notification error:', err);
    res.status(500).json({ message: 'Failed to send notifications' });
  }
});

// GET /api/notifications/history — recent broadcasts
router.get('/history', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT title, body, type, created_at, COUNT(*) as recipient_count
       FROM notifications
       GROUP BY title, body, type, created_at
       ORDER BY created_at DESC
       LIMIT 50`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch history' });
  }
});

export default router;
