// @ts-nocheck
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
import EducationalLevel from './models/EducationalLevel';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Sample educational levels
const educationalLevels = [
  {
    name: 'First Preparatory',
    nameAr: 'اولي اعدادي',
    level: 'prep',
    year: 1,
    order: 1
  },
  {
    name: 'Second Preparatory',
    nameAr: 'تانيه اعدادي',
    level: 'prep',
    year: 2,
    order: 2
  },
  {
    name: 'Third Preparatory',
    nameAr: 'تالته اعدادي',
    level: 'prep',
    year: 3,
    order: 3
  },
  {
    name: 'First Secondary',
    nameAr: 'اولي ثانوي',
    level: 'secondary',
    year: 1,
    order: 4
  },
  {
    name: 'Second Secondary',
    nameAr: 'تانيه ثانوي',
    level: 'secondary',
    year: 2,
    order: 5
  },
  {
    name: 'Third Secondary',
    nameAr: 'تالته ثانوي',
    level: 'secondary',
    year: 3,
    order: 6
  }
];

const seedDB = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Lesson.deleteMany({});
    await Exam.deleteMany({});
    await Assignment.deleteMany({});
    await Question.deleteMany({});
    await Notification.deleteMany({});
    await EducationalLevel.deleteMany({}); // Clear educational levels
    
    // Create educational levels
    const createdLevels = await EducationalLevel.insertMany(educationalLevels);
    console.log('Educational levels created:', createdLevels.length);
    
    // Sample users
    const users = [
      {
        name: 'محمد الهواري',
        phone: '01012345678',
        guardianPhone: '01087654321',
        educationalLevel: createdLevels[5]._id, // Third Secondary
        gender: 'male',
        password: '12345678',
        role: 'admin'
      },
      {
        name: 'أحمد محمد',
        phone: '01112345678',
        guardianPhone: '01187654321',
        educationalLevel: createdLevels[5]._id, // Third Secondary
        gender: 'male',
        password: '12345678',
        role: 'student'
      }
    ];
    
    // Create users
    const createdUsers = await User.insertMany(users);
    console.log('Users created:', createdUsers.length);
    
    // Sample courses
    const courses = [
      {
        title: 'فيزياء - ثالثة إعدادي - شهر أكتوبر',
        educationalLevel: createdLevels[2]._id, // Third Preparatory
        shortDescription: 'قوانين نيوتن والحركة',
        fullDescription: 'شرح مبسط لقوانين نيوتن للحركة مع أمثلة توضيحية وتمارين متنوعة',
        price: 50,
        image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400',
        vodafoneNumber: '01012345678',
        month: 10
      },
      {
        title: 'رياضيات - ثالثة ثانوي - شهر أكتوبر',
        educationalLevel: createdLevels[5]._id, // Third Secondary
        shortDescription: 'حساب التفاضل والتكامل',
        fullDescription: 'مقدمة في حساب التفاضل والتكامل مع أمثلة متنوعة',
        price: 60,
        image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400',
        vodafoneNumber: '01012345678',
        month: 10
      }
    ];
    
    // Create courses
    const createdCourses = await Course.insertMany(courses);
    console.log('Courses created:', createdCourses.length);
    
    // Sample lessons
    const lessons = [
      {
        courseId: createdCourses[0]._id,
        title: 'قوانين نيوتن للحركة',
        duration: 30,
        isLocked: false,
        videoUrl: 'https://www.youtube.com/watch?v=s7kLbthGnLE',
        description: 'شرح مبسط لقوانين نيوتن للحركة مع أمثلة توضيحية',
        order: 1
      },
      {
        courseId: createdCourses[1]._id,
        title: 'التفاضل والتكامل',
        duration: 45,
        isLocked: false,
        videoUrl: 'https://www.youtube.com/watch?v=ABC123',
        description: 'مقدمة في حساب التفاضل والتكامل',
        order: 1
      }
    ];
    
    // Create lessons
    const createdLessons = await Lesson.insertMany(lessons);
    console.log('Lessons created:', createdLessons.length);
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();