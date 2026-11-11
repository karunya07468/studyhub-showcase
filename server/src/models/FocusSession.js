import mongoose from 'mongoose';

const focusSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  minutes: { type: Number, required: true, min: 1, max: 180, default: 25 },
  completedAt: { type: Date, required: true, default: Date.now }
}, { timestamps: true });

focusSessionSchema.index({ userId: 1, completedAt: -1 });
export const FocusSession = mongoose.model('FocusSession', focusSessionSchema);
