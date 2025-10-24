import { Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import Course from '../models/Course';
import Lesson from '../models/Lesson';
import { paginate, PaginationResult } from '../utils/pagination';

// Get all courses with pagination
export const getCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, educationalLevel, isActive } = req.query;
    
    // Build query
    const query: any = {};
    if (educationalLevel) query.educationalLevel = educationalLevel;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    // Paginate results
    const result: PaginationResult<any> = await paginate(
      Course,
      query,
      { page: Number(page), limit: Number(limit) },
      { createdAt: -1 }
    );
    
    // Populate educational levels for all courses
    const coursesWithLevels = await Course.populate(result.data, { path: 'educationalLevel' });
    
    res.status(200).json({
      status: 'success',
      data: coursesWithLevels,
      pagination: result.pagination
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server Error'
    });
  }
};

// Get course by ID
export const getCourseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const course = await Course.findById(req.params.id).populate('educationalLevel');
    
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

// Get lessons for a course
export const getCourseLessons = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit } = req.query;
    
    // Check if course exists
    const course = await Course.findById(req.params.id);
    if (!course) {
      throw new AppError('Course not found', 404);
    }
    
    // Paginate lessons
    const result: PaginationResult<any> = await paginate(
      Lesson,
      { courseId: req.params.id },
      { page: Number(page), limit: Number(limit) },
      { order: 1 }
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