import mongoose, { Document, Schema } from 'mongoose';

export interface INote extends Document {
  title: string;
  year: string;
  description: string;
  price: number;
  image: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema: Schema = new Schema({
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
  description: {
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
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
NoteSchema.index({ year: 1 });
NoteSchema.index({ isActive: 1 });
NoteSchema.index({ createdAt: -1 });
NoteSchema.index({ title: 'text', description: 'text' });

export default mongoose.model<INote>('Note', NoteSchema);