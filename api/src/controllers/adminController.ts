import { Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import Course from '../models/Course';
import Exam from '../models/Exam';
import Assignment from '../models/Assignment';
import Question from '../models/Question';
import User from '../models/User';
import Subscription from '../models/Subscription';
import Lesson from '../models/Lesson';
import { Types } from 'mongoose';

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
    await Lesson.deleteMany({ courseId: req.params.id });
    
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

// Update an exam
export const updateExam = async (req: Request, res: Response): Promise<void> => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!exam) {
      throw new AppError('Exam not found', 404);
    }
    
    res.status(200).json({
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
    } else if (error.name === 'CastError') {
      res.status(400).json({
        status: 'fail',
        message: 'Invalid exam ID'
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: error.message || 'Server Error'
      });
    }
  }
};

// Delete an exam
export const deleteExam = async (req: Request, res: Response): Promise<void> => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    
    if (!exam) {
      throw new AppError('Exam not found', 404);
    }
    
    // Also delete related questions
    await Question.deleteMany({ examId: req.params.id, onModel: 'Exam' });
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error: any) {
    if (error.name === 'CastError') {
      res.status(400).json({
        status: 'fail',
        message: 'Invalid exam ID'
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

// Update an assignment
export const updateAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!assignment) {
      throw new AppError('Assignment not found', 404);
    }
    
    res.status(200).json({
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
    } else if (error.name === 'CastError') {
      res.status(400).json({
        status: 'fail',
        message: 'Invalid assignment ID'
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: error.message || 'Server Error'
      });
    }
  }
};

// Delete an assignment
export const deleteAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    
    if (!assignment) {
      throw new AppError('Assignment not found', 404);
    }
    
    // Also delete related questions
    await Question.deleteMany({ examId: req.params.id, onModel: 'Assignment' });
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error: any) {
    if (error.name === 'CastError') {
      res.status(400).json({
        status: 'fail',
        message: 'Invalid assignment ID'
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
    // Use onModel from request body, default to Exam for backward compatibility
    const questionData = {
      ...req.body,
      onModel: req.body.onModel || 'Exam'
    };
    
    const question = await Question.create(questionData);
    
    // Update exam/assignment total marks based on onModel
    await updateExamTotalMarks(question.examId.toString(), questionData.onModel);
    
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

// Update a question
export const updateQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    // First, get the existing question to check its onModel
    const existingQuestion = await Question.findById(req.params.id);
    if (!existingQuestion) {
      throw new AppError('Question not found', 404);
    }
    
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!question) {
      throw new AppError('Question not found', 404);
    }
    
    // Update exam/assignment total marks based on onModel
    await updateExamTotalMarks(question.examId.toString(), existingQuestion.onModel);
    
    res.status(200).json({
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
    } else if (error.name === 'CastError') {
      res.status(400).json({
        status: 'fail',
        message: 'Invalid question ID'
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: error.message || 'Server Error'
      });
    }
  }
};

// Delete a question
export const deleteQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    // First, get the existing question to check its onModel
    const existingQuestion = await Question.findById(req.params.id);
    if (!existingQuestion) {
      throw new AppError('Question not found', 404);
    }
    
    const question = await Question.findByIdAndDelete(req.params.id);
    
    if (!question) {
      throw new AppError('Question not found', 404);
    }
    
    // Update exam/assignment total marks based on onModel
    await updateExamTotalMarks(question.examId.toString(), existingQuestion.onModel);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error: any) {
    if (error.name === 'CastError') {
      res.status(400).json({
        status: 'fail',
        message: 'Invalid question ID'
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: error.message || 'Server Error'
      });
    }
  }
};

// Helper function to update exam/assignment total marks based on questions
const updateExamTotalMarks = async (examId: string, onModel: 'Exam' | 'Assignment' = 'Exam') => {
  try {
    // Get all questions for this exam/assignment
    const questions = await Question.find({ examId, onModel });
    
    // Calculate total marks
    const totalMarks = questions.reduce((sum, question) => sum + question.marks, 0);
    
    // Update exam/assignment total marks
    if (onModel === 'Exam') {
      await Exam.findByIdAndUpdate(examId, { totalMarks });
    } else {
      await Assignment.findByIdAndUpdate(examId, { totalMarks });
    }
  } catch (error) {
    console.error('Error updating exam/assignment total marks:', error);
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

// Get dashboard statistics
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get total courses
    const totalCourses = await Course.countDocuments();
    
    // Get total students
    const totalStudents = await User.countDocuments({ role: 'student' });
    
    // Get total employees (teachers, admins, assistants)
    const totalEmployees = await User.countDocuments({ 
      role: { $in: ['teacher', 'admin', 'assistant'] } 
    });
    
    // Get active subscriptions
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    
    // Get total sales (sum of prices of active subscriptions)
    const activeSubscriptionsWithCourses = await Subscription.find({ status: 'active' })
      .populate('courseId');
    
    let totalSales = 0;
    for (const sub of activeSubscriptionsWithCourses) {
      // Check if courseId is populated and has a price
      if (sub.courseId && sub.courseId instanceof Types.ObjectId === false) {
        // It's populated, so we can access the price property
        const course: any = sub.courseId;
        if (course.price) {
          totalSales += course.price;
        }
      }
    }
    
    // Get total payments (this would typically come from a payments collection)
    // For now, we'll use the same value as total sales
    const totalPayments = totalSales;
    
    res.status(200).json({
      status: 'success',
      data: {
        totalCourses,
        totalStudents,
        totalEmployees,
        activeSubscriptions,
        totalSales,
        totalPayments
      }
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server Error'
    });
  }
};

// Create a lesson
export const createLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const lesson = await Lesson.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: {
        lesson
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

// Update a lesson
export const updateLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!lesson) {
      throw new AppError('Lesson not found', 404);
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        lesson
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
        message: 'Invalid lesson ID'
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: error.message || 'Server Error'
      });
    }
  }
};

// Delete a lesson
export const deleteLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);
    
    if (!lesson) {
      throw new AppError('Lesson not found', 404);
    }
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error: any) {
    if (error.name === 'CastError') {
      res.status(400).json({
        status: 'fail',
        message: 'Invalid lesson ID'
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: error.message || 'Server Error'
      });
    }
  }
};

// Update subscription status
export const updateSubscriptionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['active', 'rejected'].includes(status)) {
      throw new AppError('Invalid status. Must be either "active" or "rejected"', 400);
    }

    // Find and update subscription
    const subscription = await Subscription.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('userId courseId');

    if (!subscription) {
      throw new AppError('Subscription not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: {
        subscription
      }
    });
  } catch (error: any) {
    if (error.name === 'CastError') {
      res.status(400).json({
        status: 'fail',
        message: 'Invalid subscription ID'
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: error.message || 'Server Error'
      });
    }
  }
};
