import { Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import Exam from '../models/Exam';
import Question from '../models/Question';
import Submission from '../models/Submission';
import { paginate, PaginationResult } from '../utils/pagination';

// Get all exams with pagination
export const getExams = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, courseId, lessonId, type, isActive } = req.query;
    
    // Build query
    const query: any = {};
    if (courseId) query.courseId = courseId;
    if (lessonId) query.lessonId = lessonId;
    if (type) query.type = type;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    // Paginate results
    const result: PaginationResult<any> = await paginate(
      Exam,
      query,
      { page: Number(page), limit: Number(limit) },
      { date: -1 }
    );
    
    res.status(200).json({
      status: 'success',
      data: result.data,
      pagination: result.pagination
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server Error'
    });
  }
};

// Get exam by ID
export const getExamById = async (req: Request, res: Response): Promise<void> => {
  try {
    const exam = await Exam.findById(req.params.id);
    
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

// Get questions for an exam
export const getExamQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if exam exists
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      throw new AppError('Exam not found', 404);
    }
    
    // Get questions
    const questions = await Question.find({ 
      examId: req.params.id,
      onModel: 'Exam'
    }).sort({ order: 1 });
    
    res.status(200).json({
      status: 'success',
      data: {
        questions
      }
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server Error'
    });
  }
};

// Submit exam answers
export const submitExamAnswers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { answers } = req.body;
    
    // Check if exam exists
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      throw new AppError('Exam not found', 404);
    }
    
    // Get questions for this exam
    const questions = await Question.find({ 
      examId: req.params.id,
      onModel: 'Exam'
    });
    
    // Validate answers
    if (!answers || !Array.isArray(answers)) {
      throw new AppError('Answers are required', 400);
    }
    
    // Calculate score based on individual question marks
    let score = 0;
    let totalMarks = 0;
    
    // Calculate total marks from questions
    for (const question of questions) {
      totalMarks += question.marks;
    }
    
    // Calculate score based on correct answers
    for (const answer of answers) {
      const question = questions.find(q => q._id.toString() === answer.questionId);
      if (question && question.correct === answer.selectedOption) {
        score += question.marks;
      }
    }
    
    // Create submission
    const submission = await Submission.create({
      userId: req.user._id,
      examId: req.params.id,
      onModel: 'Exam',
      answers,
      score,
      totalMarks,
      submittedAt: new Date(),
      isGraded: true,
      gradedAt: new Date()
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        submission,
        score,
        totalMarks
      }
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server Error'
    });
  }
};

// Get exam results
export const getExamResults = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if exam exists
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      throw new AppError('Exam not found', 404);
    }
    
    // Get submission
    const submission = await Submission.findOne({
      userId: req.user._id,
      examId: req.params.id,
      onModel: 'Exam'
    });
    
    if (!submission) {
      throw new AppError('No submission found for this exam', 404);
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        submission
      }
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server Error'
    });
  }
};