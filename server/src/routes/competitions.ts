import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { authMiddleware } from '../middleware';

const router = Router();
router.use(authMiddleware);

// GET /api/competitions
router.get('/', async (req: Request, res: Response) => {
  try {
    const page     = parseInt(req.query.page     as string) || 1;
    const limit    = parseInt(req.query.limit    as string) || 15;
    const offset   = (page - 1) * limit;
    const category = req.query.category as string | undefined;
    const search   = req.query.search   as string | undefined;

    const conditions: string[] = [];
    const params: unknown[] = [];
    let i = 1;

    if (category) { conditions.push(`category = $${i++}`); params.push(category); }
    if (search)   { conditions.push(`name ILIKE $${i++}`); params.push(`%${search}%`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [data, count] = await Promise.all([
      pool.query(
        `SELECT * FROM competitions ${where} ORDER BY created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
        [...params, limit, offset]
      ),
      pool.query(`SELECT COUNT(*) FROM competitions ${where}`, params),
    ]);

    const total = parseInt(count.rows[0].count);
    res.json({
      competitions: data.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch competitions' });
  }
});

// POST /api/competitions
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      name, organizer_name, category, grade_level, fee, quota,
      description, image_url, reg_open_date, reg_close_date, competition_date,
    } = req.body;

    if (!name || !organizer_name) {
      res.status(400).json({ message: 'name and organizer_name are required' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO competitions
         (name, organizer_name, category, grade_level, fee, quota,
          description, image_url, reg_open_date, reg_close_date, competition_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        name, organizer_name,
        category        || null,
        grade_level     || null,
        fee             || 0,
        quota           || null,
        description     || null,
        image_url       || null,
        reg_open_date   || null,
        reg_close_date  || null,
        competition_date || null,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create competition' });
  }
});

// PUT /api/competitions/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const {
      name, organizer_name, category, grade_level, fee, quota,
      description, image_url, reg_open_date, reg_close_date, competition_date,
    } = req.body;

    const exists = await pool.query('SELECT id FROM competitions WHERE id = $1', [req.params.id]);
    if (exists.rows.length === 0) {
      res.status(404).json({ message: 'Competition not found' });
      return;
    }

    const result = await pool.query(
      `UPDATE competitions SET
        name             = COALESCE($1, name),
        organizer_name   = COALESCE($2, organizer_name),
        category         = $3,
        grade_level      = $4,
        fee              = COALESCE($5, fee),
        quota            = $6,
        description      = $7,
        image_url        = $8,
        reg_open_date    = $9,
        reg_close_date   = $10,
        competition_date = $11
       WHERE id = $12
       RETURNING *`,
      [
        name             || null,
        organizer_name   || null,
        category         || null,
        grade_level      || null,
        fee              ?? null,
        quota            || null,
        description      || null,
        image_url        || null,
        reg_open_date    || null,
        reg_close_date   || null,
        competition_date || null,
        req.params.id,
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update competition' });
  }
});

// DELETE /api/competitions/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'DELETE FROM competitions WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Competition not found' });
      return;
    }
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete' });
  }
});

export default router;
