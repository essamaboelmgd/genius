import mongoose, { Document, Schema } from 'mongoose';

export interface ILesson extends Document {
  courseId: mongoose.Types.ObjectId;
  title: string;
  duration: number; // in minutes
  isLocked: boolean;
  videoUrl: string; // YouTube URL
  description: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema: Schema = new Schema({
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number,
    required: true,
    min: 0
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  videoUrl: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  order: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
LessonSchema.index({ courseId: 1 });
LessonSchema.index({ order: 1 });
LessonSchema.index({ isLocked: 1 });
LessonSchema.index({ createdAt: -1 });

export default mongoose.model<ILesson>('Lesson', LessonSchema);