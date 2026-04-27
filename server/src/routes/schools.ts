import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { authMiddleware } from '../middleware';

const router = Router();
router.use(authMiddleware);

// GET /api/schools
router.get('/', async (req: Request, res: Response) => {
  try {
    const page  = parseInt(req.query.page  as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const search   = req.query.search   as string | undefined;
    const province = req.query.province as string | undefined;

    const conditions: string[] = [];
    const params: unknown[] = [];
    let i = 1;

    if (search) {
      conditions.push(`(name ILIKE $${i} OR city ILIKE $${i} OR npsn ILIKE $${i})`);
      params.push(`%${search}%`);
      i++;
    }
    if (province) {
      conditions.push(`province = $${i++}`);
      params.push(province);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [data, count] = await Promise.all([
      pool.query(
        `SELECT id, npsn, name, address, city, province, created_at
         FROM schools ${where} ORDER BY name ASC LIMIT $${i} OFFSET $${i + 1}`,
        [...params, limit, offset]
      ),
      pool.query(`SELECT COUNT(*) FROM schools ${where}`, params),
    ]);

    const total = parseInt(count.rows[0].count);
    res.json({
      schools: data.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch schools' });
  }
});

// POST /api/schools
router.post('/', async (req: Request, res: Response) => {
  try {
    const { npsn, name, address, city, province } = req.body;
    if (!npsn || !name) {
      res.status(400).json({ message: 'npsn and name are required' });
      return;
    }

    const exists = await pool.query('SELECT id FROM schools WHERE npsn = $1', [npsn]);
    if (exists.rows.length > 0) {
      res.status(409).json({ message: 'School with this NPSN already exists' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO schools (npsn, name, address, city, province)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [npsn, name, address || null, city || null, province || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create school' });
  }
});

// GET /api/schools/provinces — list unique provinces
router.get('/provinces', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT province FROM schools WHERE province IS NOT NULL ORDER BY province`
    );
    res.json(result.rows.map((r) => r.province));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch provinces' });
  }
});

export default router;
