import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User.js';
import { Task } from '../models/Task.js';
import { Note } from '../models/Note.js';
import { Student } from '../models/Student.js';
import { HttpError, parse, publishChange, publishLeaderboard, safeUser } from '../lib/errors.js';

const dateOffset = days => { const date = new Date(); date.setUTCDate(date.getUTCDate() + days); return date.toISOString().slice(0, 10); };
const signupSchema = z.object({
  name: z.string().trim().min(1).max(48),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(72),
  course: z.string().trim().max(64).optional().default(''),
  shareQuizScores: z.boolean().optional().default(false)
});
const loginSchema = z.object({ email: z.string().trim().email().max(254), password: z.string().min(1).max(72) });
const profileSchema = z.object({
  name: z.string().trim().min(1).max(48).optional(),
  course: z.string().trim().max(64).optional(),
  shareQuizScores: z.boolean().optional()
}).refine(value => Object.keys(value).length > 0, 'Add a profile change.');

function makeToken(user, secret) {
  return jwt.sign({ sub: String(user._id) }, secret, { expiresIn: '7d', issuer: 'studyhub' });
}

async function seedWorkspace(user) {
  await Promise.all([
    Task.insertMany([
      { userId: user._id, title: 'Review notes from today’s lecture', due: dateOffset(0), priority: 'high' },
      { userId: user._id, title: 'Finish the group project outline', due: dateOffset(1), priority: 'medium' },
      { userId: user._id, title: 'Read chapter 4 before class', due: dateOffset(2), priority: 'low' }
    ]),
    Note.insertMany([
      { userId: user._id, title: 'A better way to study', body: 'Start with one clear goal.\n\nTry active recall: close your notes and write what you remember. Then check the gaps.\n\nNext up\n- Break the reading into small sections\n- Take a short walk between study blocks' },
      { userId: user._id, title: 'Project ideas', body: 'Things I want to explore this semester:\n\n- Build a small tool that solves a real problem\n- Ask classmates for feedback early\n- Keep a simple changelog as I work' },
      { userId: user._id, title: 'Week 1 — class notes', body: 'Questions to bring to the next study group:\n\n1. Which concepts should we practice together?\n2. What is the best way to split up the assignment?\n3. When should we meet again?' }
    ]),
    Student.insertMany([
      { userId: user._id, name: 'Ava Patel', course: user.course || 'Computer Science', cgpa: 8.8 },
      { userId: user._id, name: 'Noah Williams', course: 'Information Systems', cgpa: 8.4 },
      { userId: user._id, name: 'Mia Chen', course: user.course || 'Computer Science', cgpa: 9.2 },
      { userId: user._id, name: 'Liam Johnson', course: 'Data Science', cgpa: 7.9 },
      { userId: user._id, name: 'Sofia Garcia', course: 'Information Systems', cgpa: 8.6 },
      { userId: user._id, name: 'Ethan Kim', course: user.course || 'Computer Science', cgpa: 8.1 }
    ])
  ]);
}

export function createAuthRouter({ secret, auth, io }) {
  const router = Router();
  const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false });

  router.post('/register', authLimiter, async (req, res) => {
    const input = parse(signupSchema, req.body);
    const existing = await User.exists({ email: input.email.toLowerCase() });
    if (existing) throw new HttpError(409, 'An account with this email already exists.');
    const passwordHash = await bcrypt.hash(input.password, 12);
    let user;
    try {
      user = await User.create({ name: input.name, email: input.email, passwordHash, course: input.course, shareQuizScores: input.shareQuizScores });
    } catch (error) {
      if (error.code === 11000) throw new HttpError(409, 'An account with this email already exists.');
      throw error;
    }
    await seedWorkspace(user);
    res.status(201).json({ token: makeToken(user, secret), user: safeUser(user) });
  });

  router.post('/login', authLimiter, async (req, res) => {
    const input = parse(loginSchema, req.body);
    const user = await User.findOne({ email: input.email.toLowerCase() }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) throw new HttpError(401, 'Email or password is incorrect.');
    res.json({ token: makeToken(user, secret), user: safeUser(user) });
  });

  router.get('/me', auth, async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) throw new HttpError(401, 'Your account is no longer available.');
    res.json({ user: safeUser(user) });
  });

  router.patch('/me/profile', auth, async (req, res) => {
    const input = parse(profileSchema, req.body);
    const previous = await User.findById(req.user.id);
    if (!previous) throw new HttpError(404, 'Account not found.');
    const user = await User.findByIdAndUpdate(req.user.id, { $set: input }, { new: true, runValidators: true });
    publishChange(io, req, 'profile', 'updated');
    if (previous.shareQuizScores !== user.shareQuizScores) publishLeaderboard(io);
    res.json({ user: safeUser(user) });
  });

  return router;
}
