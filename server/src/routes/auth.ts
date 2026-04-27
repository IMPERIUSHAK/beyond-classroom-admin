import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password required' });
      return;
    }

    const result = await pool.query(
      'SELECT id, email, full_name, role, password_hash FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    if (user.role !== 'admin') {
      res.status(403).json({ message: 'Access denied. Admin only.' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
