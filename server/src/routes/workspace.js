import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Task } from '../models/Task.js';
import { Note } from '../models/Note.js';
import { Student } from '../models/Student.js';
import { QuizAttempt } from '../models/QuizAttempt.js';
import { FocusSession } from '../models/FocusSession.js';
import { User } from '../models/User.js';
import { HttpError, parse, publishChange, publishLeaderboard, safeUser } from '../lib/errors.js';
import { publicQuiz, quizQuestions } from '../lib/quiz.js';

const taskInput = z.object({
  title: z.string().trim().min(1).max(100),
  due: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal('')).optional().default(''),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium')
});
const taskPatch = taskInput.partial().extend({ done: z.boolean().optional() }).refine(value => Object.keys(value).length > 0, 'Add a task change.');
const noteInput = z.object({ title: z.string().trim().max(100).optional().default(''), body: z.string().max(50000).optional().default('') });
const notePatch = noteInput.partial().refine(value => Object.keys(value).length > 0, 'Add a note change.');
const studentInput = z.object({
  name: z.string().trim().min(1).max(48),
  course: z.string().trim().max(64).optional().default(''),
  cgpa: z.number().min(0).max(10).nullable().optional().default(null)
});
const answersInput = z.object({ answers: z.array(z.number().int().min(0).max(3)).length(quizQuestions.length) });
const focusInput = z.object({ minutes: z.number().int().min(1).max(180).optional().default(25) });

const publicTask = item => ({ id: String(item._id), title: item.title, due: item.due || '', priority: item.priority, done: item.done, completedAt: item.completedAt, createdAt: item.createdAt, updatedAt: item.updatedAt });
const publicNote = item => ({ id: String(item._id), title: item.title, body: item.body, createdAt: item.createdAt, updatedAt: item.updatedAt });
const publicStudent = item => ({ id: String(item._id), name: item.name, course: item.course, cgpa: item.cgpa, createdAt: item.createdAt });
const publicAttempt = item => ({ id: String(item._id), correct: item.correct, total: item.total, percent: item.percent, createdAt: item.createdAt });
const publicFocus = item => ({ id: String(item._id), minutes: item.minutes, completedAt: item.completedAt });
const objectId = value => mongoose.isValidObjectId(value);
const dateKey = date => { const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000); return d.toISOString().slice(0, 10); };

async function dashboardData(userId) {
  const now = new Date(); const start = new Date(now); start.setDate(start.getDate() - 6); start.setHours(0, 0, 0, 0);
  const [tasks, notes, attempts, sessions, courses] = await Promise.all([
    Task.find({ userId }).select('done completedAt'),
    Note.countDocuments({ userId }),
    QuizAttempt.find({ userId }).select('percent createdAt').sort({ createdAt: -1 }).limit(50),
    FocusSession.find({ userId, completedAt: { $gte: start } }).select('minutes completedAt'),
    Student.aggregate([{ $match: { userId: new mongoose.Types.ObjectId(userId) } }, { $group: { _id: '$course', averageCgpa: { $avg: '$cgpa' }, students: { $sum: 1 } } }, { $sort: { averageCgpa: -1 } }])
  ]);
  const days = Array.from({ length: 7 }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - (6 - index)); return { date: dateKey(date), tasks: 0, sessions: 0, minutes: 0 }; });
  const dayMap = new Map(days.map(day => [day.date, day]));
  tasks.forEach(task => { if (task.done && task.completedAt) { const day = dayMap.get(dateKey(task.completedAt)); if (day) day.tasks += 1; } });
  sessions.forEach(session => { const day = dayMap.get(dateKey(session.completedAt)); if (day) { day.sessions += 1; day.minutes += session.minutes; } });
  const quizAverage = attempts.length ? Math.round(attempts.reduce((sum, item) => sum + item.percent, 0) / attempts.length) : null;
  return { taskCount: tasks.length, openTasks: tasks.filter(task => !task.done).length, doneTasks: tasks.filter(task => task.done).length, noteCount: notes, quizAverage, quizAttempts: attempts.length, focusSessions: sessions.length, focusMinutes: sessions.reduce((sum, item) => sum + item.minutes, 0), days, courses };
}

export function createWorkspaceRouter({ auth, io }) {
  const router = Router();
  router.use(auth);

  router.get('/workspace', async (req, res) => {
    const userId = req.user.id;
    const [user, tasks, notes, students, attempts, sessions, dashboard] = await Promise.all([
      User.findById(userId), Task.find({ userId }).sort({ done: 1, due: 1, createdAt: -1 }), Note.find({ userId }).sort({ updatedAt: -1 }), Student.find({ userId }).sort({ name: 1 }), QuizAttempt.find({ userId }).sort({ createdAt: -1 }).limit(50), FocusSession.find({ userId }).sort({ completedAt: -1 }).limit(100), dashboardData(userId)
    ]);
    if (!user) throw new HttpError(401, 'Your account is no longer available.');
    res.json({ user: safeUser(user), tasks: tasks.map(publicTask), notes: notes.map(publicNote), students: students.map(publicStudent), attempts: attempts.map(publicAttempt), focusSessions: sessions.map(publicFocus), dashboard });
  });

  router.get('/dashboard', async (req, res) => res.json(await dashboardData(req.user.id)));

  router.get('/tasks', async (req, res) => {
    const tasks = await Task.find({ userId: req.user.id }).sort({ done: 1, due: 1, createdAt: -1 });
    res.json({ tasks: tasks.map(publicTask) });
  });
  router.post('/tasks', async (req, res) => {
    const input = parse(taskInput, req.body); const task = await Task.create({ ...input, userId: req.user.id });
    publishChange(io, req, 'tasks', 'created', task._id); res.status(201).json({ task: publicTask(task) });
  });
  router.patch('/tasks/:id', async (req, res) => {
    if (!objectId(req.params.id)) throw new HttpError(400, 'That task ID is invalid.');
    const input = parse(taskPatch, req.body);
    if (input.done === true) input.completedAt = new Date();
    if (input.done === false) input.completedAt = null;
    const task = await Task.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, { $set: input }, { new: true, runValidators: true });
    if (!task) throw new HttpError(404, 'Task not found.');
    publishChange(io, req, 'tasks', 'updated', task._id); res.json({ task: publicTask(task) });
  });
  router.delete('/tasks/:id', async (req, res) => {
    if (!objectId(req.params.id)) throw new HttpError(400, 'That task ID is invalid.');
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!task) throw new HttpError(404, 'Task not found.');
    publishChange(io, req, 'tasks', 'deleted', task._id); res.status(204).end();
  });

  router.get('/notes', async (req, res) => {
    const notes = await Note.find({ userId: req.user.id }).sort({ updatedAt: -1 }); res.json({ notes: notes.map(publicNote) });
  });
  router.post('/notes', async (req, res) => {
    const input = parse(noteInput, req.body); const note = await Note.create({ ...input, userId: req.user.id });
    publishChange(io, req, 'notes', 'created', note._id); res.status(201).json({ note: publicNote(note) });
  });
  router.patch('/notes/:id', async (req, res) => {
    if (!objectId(req.params.id)) throw new HttpError(400, 'That note ID is invalid.');
    const input = parse(notePatch, req.body); const note = await Note.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, { $set: input }, { new: true, runValidators: true });
    if (!note) throw new HttpError(404, 'Note not found.');
    publishChange(io, req, 'notes', 'updated', note._id); res.json({ note: publicNote(note) });
  });
  router.delete('/notes/:id', async (req, res) => {
    if (!objectId(req.params.id)) throw new HttpError(400, 'That note ID is invalid.');
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!note) throw new HttpError(404, 'Note not found.');
    publishChange(io, req, 'notes', 'deleted', note._id); res.status(204).end();
  });

  router.get('/students', async (req, res) => {
    const students = await Student.find({ userId: req.user.id }).sort({ name: 1 }); res.json({ students: students.map(publicStudent) });
  });
  router.post('/students', async (req, res) => {
    const input = parse(studentInput, req.body); const student = await Student.create({ ...input, userId: req.user.id });
    publishChange(io, req, 'students', 'created', student._id); res.status(201).json({ student: publicStudent(student) });
  });
  router.delete('/students/:id', async (req, res) => {
    if (!objectId(req.params.id)) throw new HttpError(400, 'That student ID is invalid.');
    const student = await Student.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!student) throw new HttpError(404, 'Classmate not found.');
    publishChange(io, req, 'students', 'deleted', student._id); res.status(204).end();
  });

  router.get('/quiz/questions', (_req, res) => res.json({ questions: publicQuiz(), total: quizQuestions.length }));
  router.get('/quiz/attempts', async (req, res) => {
    const attempts = await QuizAttempt.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50); res.json({ attempts: attempts.map(publicAttempt) });
  });
  router.post('/quiz/attempts', async (req, res) => {
    const { answers } = parse(answersInput, req.body);
    const correct = answers.reduce((total, answer, index) => total + Number(answer === quizQuestions[index].answer), 0);
    const attempt = await QuizAttempt.create({ userId: req.user.id, correct, total: quizQuestions.length, percent: Math.round(correct / quizQuestions.length * 100) });
    publishChange(io, req, 'attempts', 'created', attempt._id); publishLeaderboard(io);
    res.status(201).json({ attempt: publicAttempt(attempt), correctAnswers: quizQuestions.map(item => item.answer) });
  });
  router.get('/quiz/leaderboard', async (_req, res) => {
    const optedIn = await User.find({ shareQuizScores: true }).select('_id name').lean();
    if (!optedIn.length) return res.json({ leaderboard: [] });
    const users = new Map(optedIn.map(user => [String(user._id), user.name]));
    const scores = await QuizAttempt.aggregate([
      { $match: { userId: { $in: optedIn.map(user => user._id) } } },
      { $group: { _id: '$userId', best: { $max: '$percent' }, attempts: { $sum: 1 } } },
      { $sort: { best: -1, attempts: 1 } }, { $limit: 10 }
    ]);
    res.json({ leaderboard: scores.map((item, index) => ({ rank: index + 1, name: users.get(String(item._id)) || 'Student', best: item.best, attempts: item.attempts })) });
  });

  router.get('/focus-sessions', async (req, res) => {
    const sessions = await FocusSession.find({ userId: req.user.id }).sort({ completedAt: -1 }).limit(100); res.json({ sessions: sessions.map(publicFocus) });
  });
  router.post('/focus-sessions', async (req, res) => {
    const input = parse(focusInput, req.body); const session = await FocusSession.create({ ...input, userId: req.user.id });
    publishChange(io, req, 'focusSessions', 'created', session._id); res.status(201).json({ session: publicFocus(session) });
  });

  return router;
}
