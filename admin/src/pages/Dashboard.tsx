import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { CourseCard } from '@/components/CourseCard';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

// New interface for User data
interface User {
  id: string;
  name: string;
  phone: string;
  educationalLevel: string;
  gender: 'male' | 'female';
  year: string;
  role: 'student' | 'teacher' | 'admin' | 'assistant';
  createdAt: string;
}

// New interface for statistics
interface StatCard {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: string;
  isCurrency?: boolean;
}

// New interface for dashboard statistics
interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalEmployees: number;
  activeSubscriptions: number;
  totalSales: number;
  totalPayments: number;
}

// New interface for chart data
interface CourseEnrollmentData {
  name: string;
  enrollments: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subscribedCourses, setSubscribedCourses] = useState<Course[]>([]);
  const [courseEnrollmentData, setCourseEnrollmentData] = useState<CourseEnrollmentData[]>([]);
  const [latestUsers, setLatestUsers] = useState<User[]>([]); // New state for latest users
  const [stats, setStats] = useState<DashboardStats | null>(null); // State for dashboard stats
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (user) {
      try {
        // Load dashboard statistics
        const statsResponse = await api.get(`/admin/stats`);
        setStats(statsResponse.data.data);

        // Load subscriptions
        const subsResponse = await api.get(`/subscriptions`);
        const subs = subsResponse.data.data;
        setSubscriptions(subs);

        // Load courses
        const coursesResponse = await api.get(`/courses`);
        const allCourses = coursesResponse.data.data;
        setCourses(allCourses);
        
        // Filter subscribed courses
        const subCourses = allCourses.filter((c: Course) => 
          subs.some((s: Subscription) => s.courseId === c.id && s.status === 'active')
        );
        
        setSubscribedCourses(subCourses);
        
        // Calculate course enrollment data for chart
        const enrollmentData = allCourses.map(course => {
          const enrollmentCount = subs.filter((s: Subscription) => 
            s.courseId === course.id && s.status === 'active'
          ).length;
          
          return {
            name: course.title.length > 20 ? `${course.title.substring(0, 20)}...` : course.title,
            enrollments: enrollmentCount
          };
        });
        
        // Sort by enrollments descending and take top 10
        const topCourses = enrollmentData
          .sort((a, b) => b.enrollments - a.enrollments)
          .slice(0, 10);
          
        setCourseEnrollmentData(topCourses);
        
        // Load latest 10 users
        const usersResponse = await api.get(`/admin/users`);
        const allUsers = usersResponse.data.data.users;
        // Sort by creation date and take latest 10
        const sortedUsers = allUsers
          .sort((a: User, b: User) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10);
        setLatestUsers(sortedUsers);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    }
    
    setLoading(false);
  };

  // Calculate statistics cards data
  const calculateStatsCards = (): StatCard[] => {
    if (!stats) return [];
    
    return [
      {
        icon: BookOpen,
        label: 'اجمالي الكورسات',
        value: stats.totalCourses,
        color: 'text-blue-500',
      },
      {
        icon: Users,
        label: 'اجمالي الموظفين',
        value: stats.totalEmployees,
        color: 'text-green-500',
      },
      {
        icon: Users,
        label: 'اجمالي الطلبة',
        value: stats.totalStudents,
        color: 'text-purple-500',
      },
      {
        icon: FileText,
        label: 'عدد الاشتراكات',
        value: stats.activeSubscriptions,
        color: 'text-yellow-500',
      },
      {
        icon: BookOpen,
        label: 'اجمالي المبيعات',
        value: stats.totalSales,
        color: 'text-red-500',
        isCurrency: true,
      },
      {
        icon: FileText,
        label: 'اجمالي الاشتراكات',
        value: stats.totalSales, // Using totalSales as it represents the same thing
        color: 'text-indigo-500',
        isCurrency: true,
      },
      {
        icon: Users,
        label: 'اجمالي المدفوعات',
        value: stats.totalPayments,
        color: 'text-pink-500',
        isCurrency: true,
      },
    ];
  };

  const statsCards = calculateStatsCards();

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
        {/* Statistics Cards */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {statsCards.map((stat, index) => (
              <article
                key={index}
                className="bg-card border border-border rounded-xl p-6 card-elevated hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 bg-muted rounded-lg ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-bold text-foreground mt-1">
                      {stat.isCurrency ? `EGP ${stat.value.toLocaleString()}.00` : stat.value.toLocaleString()}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Top Courses Bar Chart */}
        <section>
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">اكتر الكورسات نشاطاً</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={courseEnrollmentData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 60,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={60}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <Tooltip 
                    formatter={(value) => [value.toLocaleString(), 'عدد الطلاب']}
                    labelFormatter={(value) => `الكورس: ${value}`}
                  />
                  <Legend />
                  <Bar 
                    dataKey="enrollments" 
                    name="عدد الطلاب" 
                    fill="#8884d8" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Latest Registered Students Section */}
        <section>
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">أحدث الطلبة المسجلين</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-right py-3 px-4 font-semibold">الاسم</th>
                    <th className="text-right py-3 px-4 font-semibold">رقم الهاتف</th>
                    <th className="text-right py-3 px-4 font-semibold">المستوى التعليمي</th>
                    <th className="text-right py-3 px-4 font-semibold">الصف</th>
                    <th className="text-right py-3 px-4 font-semibold">تاريخ التسجيل</th>
                  </tr>
                </thead>
                <tbody>
                  {latestUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4">{user.name}</td>
                      <td className="py-3 px-4">{user.phone}</td>
                      <td className="py-3 px-4">{user.educationalLevel}</td>
                      <td className="py-3 px-4">{user.year}</td>
                      <td className="py-3 px-4">
                        {new Date(user.createdAt).toLocaleDateString('ar-EG')}
                      </td>
                    </tr>
                  ))}
                  {latestUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted-foreground">
                        لا توجد بيانات متاحة
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}