import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { FileText, Clock, CheckCircle, XCircle, UserCheck } from 'lucide-react';
import { getExams } from '@/services/examsService';
import { type Exam } from '@/services/examsService';

export default function ExamsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const examsData = await getExams();
      setExams(examsData);
    } catch (error) {
      console.error('Error loading exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredExams = () => {
    const path = location.pathname;
    if (path.includes('/course')) {
      return exams.filter(e => e.type === 'course');
    } else if (path.includes('/general')) {
      return exams.filter(e => e.type === 'general');
    }
    return exams;
  };

  const getCourseName = (courseId: string | null) => {
    if (!courseId) return 'امتحان عام';
    // In a real implementation, you would fetch the course name from the API
    return 'كورس غير معروف';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/course')) return 'course';
    if (path.includes('/general')) return 'general';
    return 'all';
  };

  const tabs = [
    { id: 'all', label: 'كل الامتحانات', path: '/exams' },
    { id: 'course', label: 'امتحانات الكورسات', path: '/exams/course' },
    { id: 'general', label: 'امتحانات عامة', path: '/exams/general' },
  ];

  const filteredExams = getFilteredExams();

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-foreground">الامتحانات</h1>

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
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>
        ) : filteredExams.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">لا توجد امتحانات متاحة</div>
        ) : (
          <div className="space-y-4">
            {filteredExams.map(exam => (
              <article
                key={exam._id}
                className="bg-card border border-border rounded-xl p-6 card-elevated"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-accent mt-1" />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground">{exam.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {getCourseName(exam.courseId)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mr-8">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{exam.timeLimitMin} دقيقة</span>
                      </div>
                      <div>
                        <span>الدرجة: {exam.totalMarks}</span>
                      </div>
                      <div>
                        <span>{formatDate(exam.date)}</span>
                      </div>
                      {exam.mandatoryAttendance && (
                        <div className="flex items-center gap-1 text-accent">
                          <UserCheck className="w-4 h-4" />
                          <span>حضور إجباري</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mr-8">
                      {Math.random() > 0.5 ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-success/10 text-success text-sm rounded-full">
                          <CheckCircle className="w-4 h-4" />
                          تم الحل
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-50 text-yellow-700 text-sm rounded-full border border-yellow-200">
                          <XCircle className="w-4 h-4" />
                          لم يتم الحل
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline">عرض التفاصيل</Button>
                    <Button onClick={() => navigate(`/exams/${exam._id}/take`)}>
                      ابدأ الامتحان
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}