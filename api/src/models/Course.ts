import mongoose, { Document, Schema } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  year: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  image: string;
  vodafoneNumber: string;
  month: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: String,
    required: true,
    trim: true
  },
  shortDescription: {
    type: String,
    required: true,
    trim: true
  },
  fullDescription: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    required: false
  },
  vodafoneNumber: {
    type: String,
    required: false,
    trim: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
CourseSchema.index({ year: 1 });
CourseSchema.index({ month: 1 });
CourseSchema.index({ isActive: 1 });
CourseSchema.index({ createdAt: -1 });
CourseSchema.index({ title: 'text', shortDescription: 'text', fullDescription: 'text' });

export default mongoose.model<ICourse>('Course', CourseSchema);