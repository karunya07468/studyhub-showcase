import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 100 },
  due: { type: String, default: '' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  done: { type: Boolean, default: false },
  completedAt: { type: Date, default: null }
}, { timestamps: true });

taskSchema.index({ userId: 1, done: 1, due: 1 });
export const Task = mongoose.model('Task', taskSchema);
