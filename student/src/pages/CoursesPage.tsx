import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { CourseCard } from '@/components/CourseCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Search, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { Course as ServiceCourse } from '@/services/coursesService';

// Define Course interface to match API response and maintain compatibility
interface Course {
  id: string;
  title: string;
  year: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  image: string;
  vodafoneNumber: string;
  month: number;
  createdAt?: string;
  updatedAt?: string;
  _id?: string; // Optional to handle both API formats
}

interface Subscription {
  id: string;
  userId: string;
  courseId: string;
  status: 'active' | 'pending' | 'rejected';
  subscribedAt: string;
  paymentMethod: 'center' | 'vodafone' | 'code';
  vodafoneReceipt?: string;
}

const MONTHS = [
  { value: '9', label: 'سبتمبر' },
  { value: '10', label: 'أكتوبر' },
  { value: '11', label: 'نوفمبر' },
  { value: '12', label: 'ديسمبر' },
];

export default function CoursesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'center' | 'vodafone' | 'code'>('center');
  const [vodafonePhone, setVodafonePhone] = useState('');
  const [vodafoneReceipt, setVodafoneReceipt] = useState<File | null>(null);
  const [activationCode, setActivationCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, subscriptions, location.pathname, searchTerm, selectedMonth]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load courses
      const coursesResponse = await api.get('/courses');
      // Map _id to id for compatibility with existing code
      const mappedCourses: Course[] = coursesResponse.data.data.map((course: ServiceCourse) => ({
        id: course._id,
        title: course.title,
        year: course.year,
        shortDescription: course.shortDescription,
        fullDescription: course.fullDescription,
        price: course.price,
        image: course.image,
        vodafoneNumber: course.vodafoneNumber,
        month: course.month,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        _id: course._id
      }));
      setCourses(mappedCourses);
      
      // Load subscriptions if user is logged in
      if (user) {
        const subsResponse = await api.get('/subscriptions');
        setSubscriptions(subsResponse.data.data);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.error('حدث خطأ أثناء تحميل الكورسات');
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    // Filter by route
    const path = location.pathname;
    if (path.includes('/new')) {
      const subscribedIds = subscriptions.map(s => s.courseId);
      filtered = filtered.filter(c => !subscribedIds.includes(c.id)); // Use c.id (which is mapped from _id)
    } else if (path.includes('/subscribed')) {
      const subscribedIds = subscriptions.filter(s => s.status === 'active').map(s => s.courseId);
      filtered = filtered.filter(c => subscribedIds.includes(c.id)); // Use c.id (which is mapped from _id)
    } else if (path.includes('/free')) {
      filtered = filtered.filter(c => c.price === 0);
    }

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by month
    if (selectedMonth) {
      filtered = filtered.filter(c => c.month === parseInt(selectedMonth));
    }

    setFilteredCourses(filtered);
  };

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.endsWith('/new')) return 'new';
    if (path.endsWith('/subscribed')) return 'subscribed';
    if (path.endsWith('/free')) return 'free';
    return 'new';
  };

  const handleSubscribe = (course: Course) => {
    setSelectedCourse(course);
    setPaymentMethod('center');
    setVodafonePhone('');
    setVodafoneReceipt(null);
    setActivationCode('');
  };

  const handleSubscriptionSubmit = async () => {
    if (!selectedCourse) return;

    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    if (paymentMethod === 'vodafone') {
      if (!vodafoneReceipt) {
        toast.error('يرجى رفع إثبات الدفع');
        return;
      }
    }

    if (paymentMethod === 'code') {
      if (!activationCode || activationCode.length < 6) {
        toast.error('يرجى إدخال كود تفعيل صحيح');
        return;
      }
    }

    setSubmitting(true);
    try {
      await api.post('/subscriptions', {
        courseId: selectedCourse.id, // This will now be the _id value mapped in loadData
        paymentMethod,
        vodafoneReceipt: vodafoneReceipt?.name,
      });
      
      if (paymentMethod === 'center') {
        toast.success('تم إرسال طلب الاشتراك بنجاح - برجاء التواصل مع السنتر');
      } else if (paymentMethod === 'vodafone') {
        toast.success('تم إرسال إثبات الدفع - سيتم مراجعته والرد عليك قريباً');
      } else {
        toast.success('تم تفعيل الاشتراك بنجاح');
      }
      
      setSelectedCourse(null);
      loadData();
    } catch (error) {
      console.error('Error subscribing to course:', error);
      toast.error('حدث خطأ أثناء الاشتراك في الكورس');
    } finally {
      setSubmitting(false);
    }
  };

  const isSubscribed = (courseId: string) => {
    return subscriptions.some(s => s.courseId === courseId && s.status === 'active');
  };

  const tabs = [
    { id: 'new', label: 'جديدة', path: '/courses/new', count: courses.length > 0 ? courses.length - subscriptions.length : 0 },
    { id: 'subscribed', label: 'مشترك فيها', path: '/courses/subscribed', count: subscriptions.filter(s => s.status === 'active').length },
    { id: 'free', label: 'مجانية', path: '/courses/free', count: courses.length > 0 ? courses.filter(c => c.price === 0).length : 0 },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-foreground">الكورسات</h1>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-border">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`px-4 py-2 font-medium transition-smooth relative ${
                  getActiveTab() === tab.id
                    ? 'text-accent border-b-2 border-accent'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="ابحث باسم الكورس"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pr-10"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>

            <Select value={selectedMonth || undefined} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="كل الشهور" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map(month => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(searchTerm || selectedMonth) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedMonth('');
                }}
              >
                مسح الفلتر
              </Button>
            )}
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              لا توجد كورسات متاحة
            </div>
          ) : (
            filteredCourses.map(course => (
              <CourseCard
                key={course.id} // Use course.id (which is mapped from _id)
                course={course}
                isSubscribed={isSubscribed(course.id)} // Use course.id (which is mapped from _id)
                onSubscribe={handleSubscribe}
                onEnter={c => navigate(`/courses/${c.id}`)}
              />
            ))
          )}
        </div>
      </div>

      {/* Subscription Modal */}
      <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedCourse && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedCourse.title}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <img
                    src={selectedCourse.image}
                    alt={selectedCourse.title}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-2">{selectedCourse.year}</p>
                    <p className="text-foreground mb-4">{selectedCourse.fullDescription}</p>
                    <p className="text-2xl font-bold text-primary">
                      {selectedCourse.price} <span className="text-sm">ج.م</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>طريقة الدفع</Label>
                  <RadioGroup value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
                    <div className="flex items-center gap-2 p-3 border border-border rounded-lg">
                      <RadioGroupItem value="center" id="center" />
                      <Label htmlFor="center" className="cursor-pointer flex-1">الدفع من السنتر</Label>
                    </div>

                    <div className="flex items-center gap-2 p-3 border border-border rounded-lg">
                      <RadioGroupItem value="vodafone" id="vodafone" />
                      <Label htmlFor="vodafone" className="cursor-pointer flex-1">فودافون كاش</Label>
                    </div>

                    <div className="flex items-center gap-2 p-3 border border-border rounded-lg">
                      <RadioGroupItem value="code" id="code" />
                      <Label htmlFor="code" className="cursor-pointer flex-1">اشتراك بكود تفعيل</Label>
                    </div>
                  </RadioGroup>
                </div>

                {paymentMethod === 'center' && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-foreground">
                      سيتم إرسال طلب الاشتراك إلى السنتر. برجاء التواصل مع السنتر لإتمام عملية الدفع.
                    </p>
                  </div>
                )}

                {paymentMethod === 'vodafone' && (
                  <div className="space-y-4">
                    <div>
                      <Label>المبلغ المطلوب</Label>
                      <p className="text-2xl font-bold text-primary mt-1">
                        {selectedCourse.price} جنيه
                      </p>
                    </div>

                    <div>
                      <Label>رقم فودافون كاش للسنتر</Label>
                      <p className="text-lg font-medium text-foreground mt-1">
                        {selectedCourse.vodafoneNumber}
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="vodafonePhone">رقم المرسل</Label>
                      <Input
                        id="vodafonePhone"
                        placeholder="01XXXXXXXXX"
                        value={vodafonePhone}
                        onChange={e => setVodafonePhone(e.target.value)}
                        maxLength={11}
                      />
                    </div>

                    <div>
                      <Label htmlFor="receipt">إثبات الدفع (صورة أو PDF)</Label>
                      <Input
                        id="receipt"
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        onChange={e => setVodafoneReceipt(e.target.files?.[0] || null)}
                        className="mt-1"
                      />
                      {vodafoneReceipt && (
                        <p className="text-sm text-success mt-2">✓ {vodafoneReceipt.name}</p>
                      )}
                    </div>

                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        بعد رفع إثبات الدفع، سيتم مراجعته والرد عليك خلال 24 ساعة. للاستفسار: {selectedCourse.vodafoneNumber}
                      </p>
                    </div>
                  </div>
                )}

                {paymentMethod === 'code' && (
                  <div>
                    <Label htmlFor="activationCode">كود التفعيل</Label>
                    <Input
                      id="activationCode"
                      placeholder="أدخل كود التفعيل"
                      value={activationCode}
                      onChange={e => setActivationCode(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                )}

                <div className="flex gap-3">
                  <Button onClick={() => setSelectedCourse(null)} variant="outline" className="flex-1">
                    إلغاء
                  </Button>
                  <Button onClick={handleSubscriptionSubmit} disabled={submitting} className="flex-1">
                    {submitting ? 'جاري الإرسال...' : 
                      paymentMethod === 'center' ? 'إرسال الطلب' :
                      paymentMethod === 'vodafone' ? 'إرسال إثبات الدفع' :
                      'تحقق من الكود'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
