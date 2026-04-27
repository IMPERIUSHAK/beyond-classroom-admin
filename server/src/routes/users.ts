import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { authMiddleware } from '../middleware';

const router = Router();
router.use(authMiddleware);

// GET /api/users
router.get('/', async (req: Request, res: Response) => {
  try {
    const page   = parseInt(req.query.page   as string) || 1;
    const limit  = parseInt(req.query.limit  as string) || 25;
    const offset = (page - 1) * limit;
    const role   = req.query.role   as string | undefined;
    const search = req.query.search as string | undefined;

    const conditions: string[] = [];
    const params: unknown[] = [];
    let i = 1;

    if (role)   { conditions.push(`role = $${i++}`); params.push(role); }
    if (search) {
      conditions.push(`(full_name ILIKE $${i} OR email ILIKE $${i})`);
      params.push(`%${search}%`);
      i++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [data, count] = await Promise.all([
      pool.query(
        `SELECT id, email, full_name, phone, city, role, school_id, created_at
         FROM users ${where} ORDER BY created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
        [...params, limit, offset]
      ),
      pool.query(`SELECT COUNT(*) FROM users ${where}`, params),
    ]);

    const total = parseInt(count.rows[0].count);
    res.json({
      users: data.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

export default router;
