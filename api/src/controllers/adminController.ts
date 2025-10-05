import { Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import Course from '../models/Course';
import Exam from '../models/Exam';
import Assignment from '../models/Assignment';
import Question from '../models/Question';
import User from '../models/User';

// Admin middleware to check if user is admin
export const requireAdmin = (req: Request, res: Response, next: any) => {
  if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Admins only.'
    });
  }
  next();
};

// Create a new course
export const createCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const course = await Course.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: {
        course
      }
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map((val: any) => val.message);
      res.status(400).json({
        status: 'fail',
        message: message
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: error.message || 'Server Error'
      });
    }
  }
};

// Update a course
export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!course) {
      throw new AppError('Course not found', 404);
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        course
      }
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map((val: any) => val.message);
      res.status(400).json({
        status: 'fail',
        message: message
      });
    } else if (error.name === 'CastError') {
      res.status(400).json({
        status: 'fail',
        message: 'Invalid course ID'
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: error.message || 'Server Error'
      });
    }
  }
};

// Delete a course
export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    
    if (!course) {
      throw new AppError('Course not found', 404);
    }
    
    // Also delete related exams, assignments, and lessons
    await Exam.deleteMany({ courseId: req.params.id });
    await Assignment.deleteMany({ courseId: req.params.id });
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error: any) {
    if (error.name === 'CastError') {
      res.status(400).json({
        status: 'fail',
        message: 'Invalid course ID'
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: error.message || 'Server Error'
      });
    }
  }
};

// Create an exam
export const createExam = async (req: Request, res: Response): Promise<void> => {
  try {
    const exam = await Exam.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: {
        exam
      }
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map((val: any) => val.message);
      res.status(400).json({
        status: 'fail',
        message: message
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: error.message || 'Server Error'
      });
    }
  }
};

// Create an assignment
export const createAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const assignment = await Assignment.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: {
        assignment
      }
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map((val: any) => val.message);
      res.status(400).json({
        status: 'fail',
        message: message
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: error.message || 'Server Error'
      });
    }
  }
};

// Create a question
export const createQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const question = await Question.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: {
        question
      }
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map((val: any) => val.message);
      res.status(400).json({
        status: 'fail',
        message: message
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: error.message || 'Server Error'
      });
    }
  }
};

// Get all users (for admin panel)
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password');
    
    res.status(200).json({
      status: 'success',
      data: {
        users
      }
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server Error'
    });
  }
};