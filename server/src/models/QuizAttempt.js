import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  correct: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 1 },
  percent: { type: Number, required: true, min: 0, max: 100 }
}, { timestamps: true });

quizAttemptSchema.index({ userId: 1, createdAt: -1 });
export const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
