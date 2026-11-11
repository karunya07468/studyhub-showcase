import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, trim: true, maxlength: 100, default: '' },
  body: { type: String, maxlength: 50000, default: '' }
}, { timestamps: true });

noteSchema.index({ userId: 1, updatedAt: -1 });
export const Note = mongoose.model('Note', noteSchema);
