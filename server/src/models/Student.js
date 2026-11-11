import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 48 },
  course: { type: String, trim: true, maxlength: 64, default: '' },
  cgpa: { type: Number, min: 0, max: 10, default: null }
}, { timestamps: true });

studentSchema.index({ userId: 1, name: 1 });
export const Student = mongoose.model('Student', studentSchema);
