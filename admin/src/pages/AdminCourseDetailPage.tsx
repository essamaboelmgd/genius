import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Play, Lock } from 'lucide-react';
import api from '@/services/api';
import { getAssignments, createAssignment, updateAssignment, deleteAssignment } from '@/services/assignmentsService';

interface Course {
  _id: string;
  title: string;
  educationalLevel: {
    _id: string;
    name: string;
    nameAr: string;
    level: 'primary' | 'prep' | 'secondary';
    year: number;
  };
  shortDescription: string;
  fullDescription: string;
  price: number;
  image: string;
  vodafoneNumber: string;
  month: number;
  createdAt: string;
  updatedAt: string;
}

interface Lesson {
  _id: string;
  courseId: string;
  title: string;
  duration: number;
  isLocked: boolean;
  videoUrl?: string;
  description?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface Exam {
  _id: string;
  courseId: string;
  lessonId: string | null; // Added lessonId field
  title: string;
  timeLimitMin: number;
  // Removed totalMarks since it will be calculated automatically
  isActive: boolean;
  mandatoryAttendance: boolean;
  hasTimeLimit: boolean;
  createdAt: string;
  updatedAt: string;
  // Added missing fields
  type: 'course' | 'general';
  // Removed date field as it's not needed
}

interface Assignment {
  _id: string;
  courseId: string;
  lessonId: string | null;
  title: string;
  timeLimitMin: number;
  // Removed totalMarks since it will be calculated automatically
  isActive: boolean;
  mandatoryAttendance: boolean;
  hasTimeLimit: boolean;
  createdAt: string;
  updatedAt: string;
  // Added missing fields
  type: 'course' | 'general';
  // Removed date field as it's not needed
}

export default function AdminCourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lessons');
  
  // Modal states
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  
  // Form data states
  const [lessonFormData, setLessonFormData] = useState({
    courseId: id || '',
    title: '',
    description: '',
    videoUrl: '',
    duration: 0,
    isLocked: false,
    order: 1,
  });
  
  const [examFormData, setExamFormData] = useState({
    courseId: id || '',
    lessonId: 'none', // Added lessonId field
    title: '',
    timeLimitMin: 0,
    isActive: true,
    mandatoryAttendance: false,
    hasTimeLimit: false, // This should default to false
    // Added missing required fields
    type: 'course',
    // Removed date field as it's not needed
  });
  
  const [assignmentFormData, setAssignmentFormData] = useState({
    courseId: id || '',
    lessonId: 'none', // Added lessonId field
    title: '',
    timeLimitMin: 0,
    isActive: true,
    mandatoryAttendance: false,
    hasTimeLimit: false, // This should default to false
    // Added missing required fields
    type: 'course',
    // Removed totalMarks and date fields as they're not needed
  });
  
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // Load course
      const courseResponse = await api.get(`/courses/${id}`);
      setCourse(courseResponse.data.data.course);
      
      // Load lessons
      const lessonsResponse = await api.get(`/courses/${id}/lessons`);
      setLessons(lessonsResponse.data.data);
      
      // Load exams
      const examsResponse = await api.get(`/exams?courseId=${id}`);
      setExams(examsResponse.data.data);
      
      // Load assignments
      const assignmentsResponse = await getAssignments(); // Use the service function
      // Filter assignments by courseId
      const courseAssignments = assignmentsResponse.filter(assignment => assignment.courseId === id);
      setAssignments(courseAssignments);
    } catch (error) {
      console.error('Error loading course data:', error);
      toast.error('حدث خطأ أثناء تحميل بيانات الكورس');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLesson = () => {
    setEditingLesson(null);
    setLessonFormData({
      courseId: id || '',
      title: '',
      description: '',
      videoUrl: '',
      duration: 0,
      isLocked: true, // Changed default to true (locked by default)
      order: lessons.length + 1,
    });
    setIsLessonModalOpen(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setLessonFormData({
      courseId: lesson.courseId,
      title: lesson.title,
      description: lesson.description || '',
      videoUrl: lesson.videoUrl || '',
      duration: lesson.duration,
      isLocked: lesson.isLocked,
      order: lesson.order,
    });
    setIsLessonModalOpen(true);
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الدرس؟')) {
      return;
    }

    try {
      await api.delete(`/admin/lessons/${lessonId}`);
      toast.success('تم حذف الدرس بنجاح');
      loadData(); // Refresh the data
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast.error('حدث خطأ أثناء حذف الدرس');
    }
  };

  const handleAddExam = () => {
    setEditingExam(null);
    setExamFormData({
      courseId: id || '',
      lessonId: 'none', // Added lessonId field
      title: '',
      timeLimitMin: 0,
      isActive: true,
      mandatoryAttendance: false,
      hasTimeLimit: false, // This should default to false
      // Added missing required fields
      type: 'course',
      // Removed date field as it's not needed
    });
    setIsExamModalOpen(true);
  };

  const handleEditExam = (exam: Exam) => {
    setEditingExam(exam);
    setExamFormData({
      courseId: exam.courseId,
      lessonId: exam.lessonId || 'none', // Use "none" when no lesson is associated
      title: exam.title,
      timeLimitMin: exam.timeLimitMin,
      isActive: exam.isActive,
      mandatoryAttendance: exam.mandatoryAttendance,
      hasTimeLimit: exam.timeLimitMin > 0, // Set based on existing value
      // Added missing required fields
      type: exam.type || 'course',
      // Removed date field as it's not needed
    });
    setIsExamModalOpen(true);
  };

  const handleDeleteExam = async (examId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الامتحان؟')) {
      return;
    }

    try {
      await api.delete(`/admin/exams/${examId}`);
      toast.success('تم حذف الامتحان بنجاح');
      loadData();
    } catch (error) {
      console.error('Error deleting exam:', error);
      toast.error('حدث خطأ أثناء حذف الامتحان');
    }
  };

  const handleAddAssignment = () => {
    setEditingAssignment(null);
    setAssignmentFormData({
      courseId: id || '',
      lessonId: 'none', // Added lessonId field
      title: '',
      timeLimitMin: 0,
      isActive: true,
      mandatoryAttendance: false,
      hasTimeLimit: false, // This should default to false
      // Added missing required fields
      type: 'course',
      // Removed totalMarks and date fields as they're not needed
    });
    setIsAssignmentModalOpen(true);
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setAssignmentFormData({
      courseId: assignment.courseId,
      lessonId: assignment.lessonId || 'none', // Added lessonId field
      title: assignment.title,
      timeLimitMin: assignment.timeLimitMin,
      isActive: assignment.isActive,
      mandatoryAttendance: assignment.mandatoryAttendance,
      hasTimeLimit: assignment.timeLimitMin > 0, // Set based on existing value
      // Added missing required fields
      type: assignment.type || 'course',
      // Removed totalMarks and date fields as they're not needed
    });
    setIsAssignmentModalOpen(true);
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الواجب؟')) {
      return;
    }

    try {
      await deleteAssignment(assignmentId); // Use the service function
      toast.success('تم حذف الواجب بنجاح');
      loadData(); // Refresh the data
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('حدث خطأ أثناء حذف الواجب');
    }
  };

  const handleLessonFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingLesson) {
        // Update existing lesson
        await api.put(`/admin/lessons/${editingLesson._id}`, lessonFormData);
        toast.success('تم تحديث الدرس بنجاح');
      } else {
        // Create new lesson
        await api.post('/admin/lessons', lessonFormData);
        toast.success('تم إنشاء الدرس بنجاح');
      }
      
      setIsLessonModalOpen(false);
      loadData(); // Refresh the data
    } catch (error: any) {
      console.error('Error saving lesson:', error);
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء حفظ الدرس');
    }
  };

  const handleExamFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Adjust timeLimitMin based on hasTimeLimit
      const formData = {
        ...examFormData,
        timeLimitMin: examFormData.hasTimeLimit ? examFormData.timeLimitMin : 0
      };
      
      // Handle lessonId - if "none" or empty, remove it from formData
      if (!formData.lessonId || formData.lessonId === "none") {
        delete formData.lessonId;
      }
      
      let examId;
      if (editingExam) {
        // Update existing exam
        const response = await api.put(`/admin/exams/${editingExam._id}`, formData);
        examId = response.data.data.exam._id;
        toast.success('تم تحديث الامتحان بنجاح');
      } else {
        // Create new exam
        const response = await api.post('/admin/exams', formData);
        examId = response.data.data.exam._id;
        toast.success('تم إنشاء الامتحان بنجاح');
      }
      
      setIsExamModalOpen(false);
      loadData();
      
      // Redirect to exam detail page
      if (examId) {
        navigate(`/admin/exams/${examId}`);
      }
    } catch (error: any) {
      console.error('Error saving exam:', error);
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء حفظ الامتحان');
    }
  };

  const handleAssignmentFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Adjust timeLimitMin based on hasTimeLimit
      const formData = {
        ...assignmentFormData,
        timeLimitMin: assignmentFormData.hasTimeLimit ? assignmentFormData.timeLimitMin : 0
      };
      
      // Handle lessonId - if "none" or empty, remove it from formData
      if (!formData.lessonId || formData.lessonId === "none") {
        delete formData.lessonId;
      }
      
      // Ensure type is properly typed
      const typedFormData = {
        ...formData,
        type: formData.type as 'course' | 'general'
      };
      
      let assignmentId;
      if (editingAssignment) {
        // Update existing assignment
        const response = await updateAssignment(editingAssignment._id, typedFormData); // Use the service function
        assignmentId = response._id;
        toast.success('تم تحديث الواجب بنجاح');
      } else {
        // Create new assignment
        const response = await createAssignment(typedFormData); // Use the service function
        assignmentId = response._id;
        toast.success('تم إنشاء الواجب بنجاح');
      }
      
      setIsAssignmentModalOpen(false);
      loadData(); // Refresh the data
      
      // Redirect to assignment questions page
      if (assignmentId) {
        navigate(`/admin/assignments/${assignmentId}`); // This should be the assignment questions page
      }
    } catch (error: any) {
      console.error('Error saving assignment:', error);
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء حفظ الواجب');
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <div>جاري التحميل...</div>
        </div>
      </AppShell>
    );
  }

  if (!course) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <div>الكورس غير موجود</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">{course.title}</h1>
          <Button onClick={() => navigate(`/courses/manage`)}>العودة إلى إدارة الكورسات</Button>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-foreground mb-2">المستوى الدراسي</h3>
              <p className="text-muted-foreground">{course.educationalLevel.nameAr}</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">الشهر</h3>
              <p className="text-muted-foreground">{course.month}</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">السعر</h3>
              <p className="text-muted-foreground">{course.price} ج.م</p>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-semibold text-foreground mb-2">الوصف</h3>
            <p className="text-muted-foreground">{course.fullDescription}</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="lessons">الدروس</TabsTrigger>
            <TabsTrigger value="exams">الامتحانات</TabsTrigger>
            <TabsTrigger value="assignments">الواجبات</TabsTrigger>
          </TabsList>

          <TabsContent value="lessons" className="space-y-4 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-foreground">الدروس</h2>
              <Button onClick={handleAddLesson} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                إضافة درس
              </Button>
            </div>

            {lessons.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                لا توجد دروس متاحة
              </div>
            ) : (
              <div className="space-y-3">
                {lessons.map((lesson, index) => (
                  <div key={lesson._id} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-muted p-2 rounded-lg">
                          <Play className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{lesson.title}</h3>
                          <p className="text-sm text-muted-foreground">{lesson.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {lesson.isLocked && (
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="text-sm text-muted-foreground">
                          {lesson.duration} دقيقة
                        </span>
                        <Button variant="outline" size="sm" onClick={() => handleEditLesson(lesson)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteLesson(lesson._id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="exams" className="space-y-4 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-foreground">الامتحانات</h2>
              <Button onClick={handleAddExam} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                إضافة امتحان
              </Button>
            </div>

            {exams.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                لا توجد امتحانات متاحة
              </div>
            ) : (
              <div className="space-y-3">
                {exams.map(exam => (
                  <div key={exam._id} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{exam.title}</h3>
                        {/* Display associated lesson if exists */}
                        {exam.lessonId && exam.lessonId !== 'none' && (
                          <div className="text-sm text-muted-foreground mt-1">
                            الدرس: {lessons.find(lesson => lesson._id === exam.lessonId)?.title || 'غير معروف'}
                          </div>
                        )}
                        <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                          <span>{exam.timeLimitMin > 0 ? `${exam.timeLimitMin} دقيقة` : 'بدون وقت محدد'}</span>
                          <span>الحضور إجباري: {exam.mandatoryAttendance ? 'نعم' : 'لا'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/admin/exams/${exam._id}`)}>
                          إدارة الأسئلة
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditExam(exam)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteExam(exam._id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-foreground">الواجبات</h2>
              <Button onClick={handleAddAssignment} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                إضافة واجب
              </Button>
            </div>

            {assignments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                لا توجد واجبات متاحة
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.map(assignment => (
                  <div key={assignment._id} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{assignment.title}</h3>
                        {/* Display associated lesson if exists */}
                        {assignment.lessonId && assignment.lessonId !== 'none' && (
                          <div className="text-sm text-muted-foreground mt-1">
                            الدرس: {lessons.find(lesson => lesson._id === assignment.lessonId)?.title || 'غير معروف'}
                          </div>
                        )}
                        <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                          <span>{assignment.timeLimitMin > 0 ? `${assignment.timeLimitMin} دقيقة` : 'بدون وقت محدد'}</span>
                          <span>الحضور إجباري: {assignment.mandatoryAttendance ? 'نعم' : 'لا'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/admin/assignments/${assignment._id}`)}>
                          إدارة الأسئلة
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditAssignment(assignment)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteAssignment(assignment._id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Lesson Form Modal */}
      <Dialog open={isLessonModalOpen} onOpenChange={setIsLessonModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLesson ? 'تعديل الدرس' : 'إضافة درس جديد'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleLessonFormSubmit} className="space-y-4">
            <input type="hidden" value={lessonFormData.courseId} />
            
            <div>
              <Label htmlFor="lessonTitle">عنوان الدرس</Label>
              <Input
                id="lessonTitle"
                value={lessonFormData.title}
                onChange={(e) => setLessonFormData({...lessonFormData, title: e.target.value})}
                required
              />
            </div>

            <div>
              <Label htmlFor="lessonDescription">وصف الدرس</Label>
              <Textarea
                id="lessonDescription"
                value={lessonFormData.description}
                onChange={(e) => setLessonFormData({...lessonFormData, description: e.target.value})}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="videoUrl">رابط الفيديو (YouTube)</Label>
              <Input
                id="videoUrl"
                value={lessonFormData.videoUrl}
                onChange={(e) => setLessonFormData({...lessonFormData, videoUrl: e.target.value})}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">مدة الدرس (بالدقائق)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={lessonFormData.duration}
                  onChange={(e) => setLessonFormData({...lessonFormData, duration: Number(e.target.value)})}
                  min="0"
                />
              </div>

              <div>
                <Label htmlFor="order">ترتيب الدرس</Label>
                <Input
                  id="order"
                  type="number"
                  value={lessonFormData.order}
                  onChange={(e) => setLessonFormData({...lessonFormData, order: Number(e.target.value)})}
                  min="1"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="isLocked"
                type="checkbox"
                checked={lessonFormData.isLocked}
                onChange={(e) => setLessonFormData({...lessonFormData, isLocked: e.target.checked})}
                className="rounded"
              />
              <Label htmlFor="isLocked">الدرس مقفل</Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsLessonModalOpen(false)} className="flex-1">
                إلغاء
              </Button>
              <Button type="submit" className="flex-1">
                {editingLesson ? 'تحديث' : 'إنشاء'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Exam Form Modal */}
      <Dialog open={isExamModalOpen} onOpenChange={setIsExamModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingExam ? 'تعديل الامتحان' : 'إضافة امتحان جديد'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleExamFormSubmit} className="space-y-4">
            <input type="hidden" value={examFormData.courseId} />
            
            <div>
              <Label htmlFor="examTitle">عنوان الامتحان</Label>
              <Input
                id="examTitle"
                value={examFormData.title}
                onChange={(e) => setExamFormData({...examFormData, title: e.target.value})}
                required
              />
            </div>

            {/* Lesson selection dropdown */}
            <div>
              <Label htmlFor="examLesson">الدرس المرتبط بالامتحان</Label>
              <Select 
                value={examFormData.lessonId || undefined} 
                onValueChange={(value) => setExamFormData({...examFormData, lessonId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الدرس" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">لا يوجد درس مرتبط</SelectItem>
                  {lessons.map((lesson) => (
                    <SelectItem key={lesson._id} value={lesson._id}>
                      {lesson.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Added missing fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="examType">نوع الامتحان</Label>
                <Select 
                  value={examFormData.type} 
                  onValueChange={(value) => setExamFormData({...examFormData, type: value as 'course' | 'general'})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="course">امتحان كورس</SelectItem>
                    <SelectItem value="general">امتحان عام</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Removed totalMarks field since it will be calculated automatically */}
              {/* Removed date field as it's not needed */}
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="hasTimeLimit"
                type="checkbox"
                checked={examFormData.hasTimeLimit}
                onChange={(e) => setExamFormData({...examFormData, hasTimeLimit: e.target.checked})}
                className="rounded"
              />
              <Label htmlFor="hasTimeLimit">هل للامتحان وقت محدد؟</Label>
            </div>

            {examFormData.hasTimeLimit && (
              <div>
                <Label htmlFor="timeLimitMin">مدة الامتحان (بالدقائق)</Label>
                <Input
                  id="timeLimitMin"
                  type="number"
                  value={examFormData.timeLimitMin}
                  onChange={(e) => setExamFormData({...examFormData, timeLimitMin: Number(e.target.value)})}
                  min="1"
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                id="mandatoryAttendance"
                type="checkbox"
                checked={examFormData.mandatoryAttendance}
                onChange={(e) => setExamFormData({...examFormData, mandatoryAttendance: e.target.checked})}
                className="rounded"
              />
              <Label htmlFor="mandatoryAttendance">هل الحضور إجباري قبل الدرس التالي؟</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="examIsActive"
                type="checkbox"
                checked={examFormData.isActive}
                onChange={(e) => setExamFormData({...examFormData, isActive: e.target.checked})}
                className="rounded"
              />
              <Label htmlFor="examIsActive">الامتحان مفعل</Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsExamModalOpen(false)} className="flex-1">
                إلغاء
              </Button>
              <Button type="submit" className="flex-1">
                {editingExam ? 'تحديث' : 'إنشاء'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assignment Form Modal */}
      <Dialog open={isAssignmentModalOpen} onOpenChange={setIsAssignmentModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAssignment ? 'تعديل الواجب' : 'إضافة واجب جديد'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAssignmentFormSubmit} className="space-y-4">
            <input type="hidden" value={assignmentFormData.courseId} />
            
            <div>
              <Label htmlFor="assignmentTitle">عنوان الواجب</Label>
              <Input
                id="assignmentTitle"
                value={assignmentFormData.title}
                onChange={(e) => setAssignmentFormData({...assignmentFormData, title: e.target.value})}
                required
              />
            </div>

            {/* Lesson selection dropdown */}
            <div>
              <Label htmlFor="assignmentLesson">الدرس المرتبط بالواجب</Label>
              <Select 
                value={assignmentFormData.lessonId || undefined} 
                onValueChange={(value) => setAssignmentFormData({...assignmentFormData, lessonId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الدرس" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">لا يوجد درس مرتبط</SelectItem>
                  {lessons.map((lesson) => (
                    <SelectItem key={lesson._id} value={lesson._id}>
                      {lesson.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Added missing fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="assignmentType">نوع الواجب</Label>
                <Select 
                  value={assignmentFormData.type} 
                  onValueChange={(value) => setAssignmentFormData({...assignmentFormData, type: value as 'course' | 'general'})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="course">واجب كورس</SelectItem>
                    <SelectItem value="general">واجب عام</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Removed totalMarks field since it will be calculated automatically */}
              {/* Removed date field as it's not needed */}
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="assignmentHasTimeLimit"
                type="checkbox"
                checked={assignmentFormData.hasTimeLimit}
                onChange={(e) => setAssignmentFormData({...assignmentFormData, hasTimeLimit: e.target.checked})}
                className="rounded"
              />
              <Label htmlFor="assignmentHasTimeLimit">هل للواجب وقت محدد؟</Label>
            </div>

            {assignmentFormData.hasTimeLimit && (
              <div>
                <Label htmlFor="assignmentTimeLimitMin">مدة الواجب (بالدقائق)</Label>
                <Input
                  id="assignmentTimeLimitMin"
                  type="number"
                  value={assignmentFormData.timeLimitMin}
                  onChange={(e) => setAssignmentFormData({...assignmentFormData, timeLimitMin: Number(e.target.value)})}
                  min="1"
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                id="assignmentMandatoryAttendance"
                type="checkbox"
                checked={assignmentFormData.mandatoryAttendance}
                onChange={(e) => setAssignmentFormData({...assignmentFormData, mandatoryAttendance: e.target.checked})}
                className="rounded"
              />
              <Label htmlFor="assignmentMandatoryAttendance">هل الحضور إجباري قبل الدرس التالي؟</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="assignmentIsActive"
                type="checkbox"
                checked={assignmentFormData.isActive}
                onChange={(e) => setAssignmentFormData({...assignmentFormData, isActive: e.target.checked})}
                className="rounded"
              />
              <Label htmlFor="assignmentIsActive">الواجب مفعل</Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAssignmentModalOpen(false)} className="flex-1">
                إلغاء
              </Button>
              <Button type="submit" className="flex-1">
                {editingAssignment ? 'تحديث' : 'إنشاء'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}