import mongoose, { Document, Schema } from 'mongoose';

export interface IExam extends Document {
  courseId: mongoose.Types.ObjectId | null;
  lessonId: mongoose.Types.ObjectId | null;
  title: string;
  date: Date;
  timeLimitMin: number;
  totalMarks: number;
  type: 'course' | 'general';
  isActive: boolean;
  mandatoryAttendance: boolean; // New field to indicate if attendance is mandatory
  createdAt: Date;
  updatedAt: Date;
}

const ExamSchema: Schema = new Schema({
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: false
  },
  lessonId: {
    type: Schema.Types.ObjectId,
    ref: 'Lesson',
    required: false
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  timeLimitMin: {
    type: Number,
    required: true,
    min: 0
  },
  totalMarks: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    required: true,
    enum: ['course', 'general']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  mandatoryAttendance: {
    type: Boolean,
    default: false // By default, attendance is not mandatory
  }
}, {
  timestamps: true
});

// Indexes for better query performance
ExamSchema.index({ courseId: 1 });
ExamSchema.index({ lessonId: 1 });
ExamSchema.index({ type: 1 });
ExamSchema.index({ isActive: 1 });
ExamSchema.index({ date: -1 });
ExamSchema.index({ createdAt: -1 });

export default mongoose.model<IExam>('Exam', ExamSchema);