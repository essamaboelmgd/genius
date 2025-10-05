import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  phone: string;
  guardianPhone: string;
  educationalLevel: string;
  gender: 'male' | 'female';
  year: string;
  password: string;
  role: 'student' | 'teacher' | 'admin' | 'assistant';
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (password: string) => Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  guardianPhone: {
    type: String,
    required: false,
    trim: true
  },
  educationalLevel: {
    type: String,
    required: true,
    trim: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female']
  },
  year: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    required: true,
    enum: ['student', 'teacher', 'admin', 'assistant'],
    default: 'student'
  },
  permissions: [{
    type: String,
    required: false
  }]
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Indexes for better query performance (excluding phone since it has unique: true)
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });

export default mongoose.model<IUser>('User', UserSchema);