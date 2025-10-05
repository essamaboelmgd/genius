import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { CourseCard } from '@/components/CourseCard';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

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

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subscribedCourses, setSubscribedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (user) {
      try {
        // Load  subscriptions
        const subsResponse = await api.get(`/subscriptions`);
        const subs = subsResponse.data.data;
        setSubscriptions(subs);

        // Load courses
        const coursesResponse = await api.get(`/courses`);
        const allCourses = coursesResponse.data.data;
        
        // Filter subscribed courses
        const subCourses = allCourses.filter((c: Course) => 
          subs.some((s: Subscription) => s.courseId === c.id && s.status === 'active')
        );
        
        setSubscribedCourses(subCourses);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    }
    
    setLoading(false);
  };

  const stats = [
    {
      icon: BookOpen,
      label: 'عدد الاشتراكات',
      value: subscriptions.filter(s => s.status === 'active').length,
      color: 'text-accent',
    },
    {
      icon: FileText,
      label: 'الامتحانات النشطة',
      value: 3,
      color: 'text-success',
    },
    {
      icon: Users,
      label: 'عدد الكورسات',
      value: subscribedCourses.length,
      color: 'text-primary',
    },
  ];

  // If loading, show loading indicator
  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <div>جاري التحميل...</div>
        </div>
      </AppShell>
    );
  }

  // If no user, show a message instead of redirecting
  if (!user) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-2xl font-bold mb-4">غير مسجل دخول</h2>
          <p className="mb-4">يجب تسجيل الدخول لرؤية محتوى الصفحة</p>
          <Button onClick={() => navigate('/login')}>
            تسجيل دخول
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Welcome Banner */}
        <section className="relative bg-gradient-to-l from-muted to-background border border-border rounded-2xl p-8 md:p-12 overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              أهلاً، {user?.name || 'الطالب'}
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              اشترِ الكورسات اللي أنت محتاجها بسعر قليل مع خصومات مميزة!
            </p>
            <Button
              onClick={() => navigate('/courses/new')}
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              عرض الكورسات
            </Button>
          </div>
          {/* Decorative element */}
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full -translate-x-1/2 translate-y-1/2"></div>
        </section>

        {/* Statistics Cards */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <article
                key={index}
                className="bg-card border border-border rounded-xl p-6 card-elevated"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 bg-muted rounded-lg ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Subscribed Courses */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">كورساتي</h2>
            <Button
              variant="outline"
              onClick={() => navigate('/courses/subscribed')}
            >
              عرض الكل
            </Button>
          </div>

          {subscribedCourses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">لم تشترك في أي كورسات بعد</p>
              <Button onClick={() => navigate('/courses/new')}>تصفح الكورسات</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subscribedCourses.slice(0, 3).map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isSubscribed
                  onEnter={c => navigate(`/courses/${c.id}`)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}