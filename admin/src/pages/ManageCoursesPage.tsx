import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import api from '@/services/api';

interface Course {
  _id: string;
  title: string;
  year: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  image: string;
  vodafoneNumber: string;
  month: number;
  createdAt: string;
  updatedAt: string;
}

const MONTHS = [
  { value: '1', label: 'يناير' },
  { value: '2', label: 'فبراير' },
  { value: '3', label: 'مارس' },
  { value: '4', label: 'أبريل' },
  { value: '5', label: 'مايو' },
  { value: '6', label: 'يونيو' },
  { value: '7', label: 'يوليو' },
  { value: '8', label: 'أغسطس' },
  { value: '9', label: 'سبتمبر' },
  { value: '10', label: 'أكتوبر' },
  { value: '11', label: 'نوفمبر' },
  { value: '12', label: 'ديسمبر' },
];

const YEARS = [
  { value: 'الصف الأول الثانوي', label: 'الصف الأول الثانوي' },
  { value: 'الصف الثاني الثانوي', label: 'الصف الثاني الثانوي' },
  { value: 'الصف الثالث الثانوي', label: 'الصف الثالث الثانوي' },
];

export default function ManageCoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    year: '',
    shortDescription: '',
    fullDescription: '',
    price: 0,
    image: '',
    vodafoneNumber: '',
    month: 1,
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data.data);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.error('حدث خطأ أثناء تحميل الكورسات');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = () => {
    setEditingCourse(null);
    setFormData({
      title: '',
      year: '',
      shortDescription: '',
      fullDescription: '',
      price: 0,
      image: '',
      vodafoneNumber: '',
      month: 1,
    });
    setIsModalOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      year: course.year,
      shortDescription: course.shortDescription,
      fullDescription: course.fullDescription,
      price: course.price,
      image: course.image || '',
      vodafoneNumber: course.vodafoneNumber || '',
      month: course.month,
    });
    setIsModalOpen(true);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الكورس؟')) {
      return;
    }

    try {
      await api.delete(`/admin/courses/${courseId}`);
      toast.success('تم حذف الكورس بنجاح');
      loadCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('حدث خطأ أثناء حذف الكورس');
    }
  };

  const handleViewCourse = (courseId: string) => {
    navigate(`/admin/courses/${courseId}`);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCourse) {
        // Update existing course
        await api.put(`/admin/courses/${editingCourse._id}`, formData);
        toast.success('تم تحديث الكورس بنجاح');
      } else {
        // Create new course
        await api.post('/admin/courses', formData);
        toast.success('تم إنشاء الكورس بنجاح');
      }
      
      setIsModalOpen(false);
      loadCourses();
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error('حدث خطأ أثناء حفظ الكورس');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'month' ? Number(value) : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'month' ? Number(value) : value
    }));
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

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">إدارة الكورسات</h1>
          <Button onClick={handleCreateCourse} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            إضافة كورس جديد
          </Button>
        </div>

        {/* Courses Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-right py-3 px-4 font-semibold">اسم الكورس</th>
                <th className="text-right py-3 px-4 font-semibold">الصف</th>
                <th className="text-right py-3 px-4 font-semibold">الشهر</th>
                <th className="text-right py-3 px-4 font-semibold">السعر</th>
                <th className="text-right py-3 px-4 font-semibold">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground">
                    لا توجد كورسات متاحة
                  </td>
                </tr>
              ) : (
                courses.map(course => (
                  <tr key={course._id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4">{course.title}</td>
                    <td className="py-3 px-4">{course.year}</td>
                    <td className="py-3 px-4">
                      {MONTHS.find(m => m.value === course.month.toString())?.label || course.month}
                    </td>
                    <td className="py-3 px-4">{course.price} ج.م</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleViewCourse(course._id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditCourse(course)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteCourse(course._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Course Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? 'تعديل الكورس' : 'إضافة كورس جديد'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">اسم الكورس</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="year">الصف</Label>
              <Select 
                value={formData.year} 
                onValueChange={(value) => handleSelectChange('year', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الصف" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map(year => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="month">الشهر</Label>
              <Select 
                value={formData.month.toString()} 
                onValueChange={(value) => handleSelectChange('month', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الشهر" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map(month => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="price">السعر (ج.م)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>

            <div>
              <Label htmlFor="shortDescription">وصف مختصر</Label>
              <Textarea
                id="shortDescription"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="fullDescription">وصف كامل</Label>
              <Textarea
                id="fullDescription"
                name="fullDescription"
                value={formData.fullDescription}
                onChange={handleInputChange}
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="image">رابط الصورة</Label>
              <Input
                id="image"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="vodafoneNumber">رقم فودافون كاش</Label>
              <Input
                id="vodafoneNumber"
                name="vodafoneNumber"
                value={formData.vodafoneNumber}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
                إلغاء
              </Button>
              <Button type="submit" className="flex-1">
                {editingCourse ? 'تحديث' : 'إنشاء'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}