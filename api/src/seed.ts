import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import User from './models/User';
import Course from './models/Course';
import Lesson from './models/Lesson';
import Exam from './models/Exam';
import Assignment from './models/Assignment';
import Question from './models/Question';
import Notification from './models/Notification';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Sample data
const users = [
  {
    name: 'محمد الهواري',
    phone: '01012345678',
    guardianPhone: '01087654321',
    educationalLevel: 'sec',
    gender: 'male',
    year: '3',
    password: '12345678',
    role: 'admin'
  },
  {
    name: 'أحمد محمد',
    phone: '01112345678',
    guardianPhone: '01187654321',
    educationalLevel: 'sec',
    gender: 'male',
    year: '3',
    password: '12345678',
    role: 'student'
  }
];

// We'll populate these after creation
let lessons: any[] = [
  {
    courseId: '',
    title: 'قوانين نيوتن للحركة',
    duration: 30,
    isLocked: false,
    videoUrl: 'https://www.youtube.com/watch?v=s7kLbthGnLE',
    description: 'شرح مبسط لقوانين نيوتن للحركة مع أمثلة توضيحية',
    order: 1
  },
  {
    courseId: '',
    title: 'الديناميكا الحرارية',
    duration: 45,
    isLocked: true,
    videoUrl: 'https://www.youtube.com/watch?v=example2', // Added required videoUrl
    description: 'مبادئ الديناميكا الحرارية والقوانين الأساسية',
    order: 2
  }
];

let courses: any[] = [
  {
    title: 'فيزياء 3 ثانوي - الترم الأول',
    year: '3',
    shortDescription: 'كورس شامل لفيزياء 3 ثانوي الترم الأول',
    fullDescription: 'كورس متكامل يغطي جميع دروس فيزياء 3 ثانوي الترم الأول مع شرح مبسط وأمثلة تطبيقية',
    price: 150,
    image: 'https://placehold.co/400x200/3b82f6/ffffff?text=فيزياء+3+ثانوي',
    vodafoneNumber: '01012345678',
    month: 9
  }
];

let exams: any[] = [
  {
    courseId: '',
    lessonId: '',
    title: 'اختبار قوانين نيوتن',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    timeLimitMin: 30,
    totalMarks: 20,
    type: 'course',
    mandatoryAttendance: true
  }
];

let assignments: any[] = [
  {
    courseId: '',
    lessonId: '',
    title: 'واجب الديناميكا الحرارية',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
    timeLimitMin: 45,
    totalMarks: 15,
    type: 'course',
    mandatoryAttendance: false
  }
];

let questions: any[] = [
  {
    examId: '',
    onModel: 'Exam',
    type: 'text',
    content: 'ما هي وحدة قياس القوة في النظام الدولي؟',
    options: [
      { id: 'a', text: 'كيلوجرام' },
      { id: 'b', text: 'متر' },
      { id: 'c', text: 'نيوتن' },
      { id: 'd', text: 'جول' }
    ],
    correct: 'c',
    explanation: 'وحدة قياس القوة في النظام الدولي هي نيوتن (N)',
    order: 1
  },
  {
    examId: '',
    onModel: 'Assignment',
    type: 'text',
    content: 'اشرح مفهوم الطاقة الداخلية',
    options: [],
    correct: '',
    explanation: 'الطاقة الداخلية هي مجموع الطاقات الحركية والكامنة لجزيئات المادة',
    order: 1
  }
];

const seedDatabase = async () => {
  try {
    console.log('Clearing existing data...');
    
    // Clear existing data
    await User.deleteMany();
    await Course.deleteMany();
    await Lesson.deleteMany();
    await Exam.deleteMany();
    await Assignment.deleteMany();
    await Question.deleteMany();
    await Notification.deleteMany();
    
    console.log('Existing data cleared');
    
    // Create users
    const createdUsers = await User.create(users);
    console.log('Users created:', createdUsers.length);
    
    // Create courses
    const createdCourses = await Course.create(courses);
    console.log('Courses created:', createdCourses.length);
    
    // Update lessons with course IDs
    lessons[0].courseId = createdCourses[0]._id;
    lessons[1].courseId = createdCourses[0]._id;
    
    // Create lessons
    const createdLessons = await Lesson.create(lessons);
    console.log('Lessons created:', createdLessons.length);
    
    // Update exams with course and lesson IDs
    exams[0].courseId = createdCourses[0]._id;
    exams[0].lessonId = createdLessons[0]._id;
    
    // Create exams
    const createdExams = await Exam.create(exams);
    console.log('Exams created:', createdExons.length);
    
    // Update assignments with course and lesson IDs
    assignments[0].courseId = createdCourses[0]._id;
    assignments[0].lessonId = createdLessons[0]._id;
    
    // Create assignments
    const createdAssignments = await Assignment.create(assignments);
    console.log('Assignments created:', createdAssignments.length);
    
    // Update questions with exam/assignment IDs
    questions[0].examId = createdExams[0]._id;
    questions[1].examId = createdAssignments[0]._id;
    
    // Create questions
    const createdQuestions = await Question.create(questions);
    console.log('Questions created:', createdQuestions.length);
    
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();