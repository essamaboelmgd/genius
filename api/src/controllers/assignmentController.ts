import { Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import Assignment from '../models/Assignment';
import Question from '../models/Question';
import Submission from '../models/Submission';
import { paginate, PaginationResult } from '../utils/pagination';

// Get all assignments with pagination
export const getAssignments = async (req: Request, res: Response): Promise<void> => {
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
      Assignment,
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

// Get assignment by ID
export const getAssignmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
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

// Get questions for an assignment
export const getAssignmentQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if assignment exists
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      throw new AppError('Assignment not found', 404);
    }
    
    // Get questions
    const questions = await Question.find({ 
      examId: req.params.id,
      onModel: 'Assignment'
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

// Submit assignment answers
export const submitAssignmentAnswers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { answers } = req.body;
    
    // Check if assignment exists
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      throw new AppError('Assignment not found', 404);
    }
    
    // Get questions for this assignment
    const questions = await Question.find({ 
      examId: req.params.id,
      onModel: 'Assignment'
    });
    
    // Validate answers
    if (!answers || !Array.isArray(answers)) {
      throw new AppError('Answers are required', 400);
    }
    
    // Calculate score
    let score = 0;
    const totalMarks = assignment.totalMarks;
    
    for (const answer of answers) {
      const question = questions.find(q => q._id.toString() === answer.questionId);
      if (question && question.correct === answer.selectedOption) {
        score += Math.floor(totalMarks / questions.length);
      }
    }
    
    // Create submission
    const submission = await Submission.create({
      userId: req.user._id,
      examId: req.params.id,
      onModel: 'Assignment',
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

// Get assignment results
export const getAssignmentResults = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if assignment exists
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      throw new AppError('Assignment not found', 404);
    }
    
    // Get submission
    const submission = await Submission.findOne({
      userId: req.user._id,
      examId: req.params.id,
      onModel: 'Assignment'
    });
    
    if (!submission) {
      throw new AppError('No submission found for this assignment', 404);
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