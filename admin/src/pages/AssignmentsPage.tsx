import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { ClipboardList, Clock, UserCheck } from 'lucide-react';
import { getAssignments } from '@/services/assignmentsService';
import { type Assignment } from '@/services/assignmentsService';

export default function AssignmentsPage() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      const assignmentsData = await getAssignments();
      setAssignments(assignmentsData);
    } catch (error) {
      console.error('Failed to load assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeLeft = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due.getTime() - now.getTime();

    if (diff < 0) return 'انتهى الوقت';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `متبقي ${days} يوم`;
    if (hours > 0) return `متبقي ${hours} ساعة`;
    return `متبقي ${minutes} دقيقة`;
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">جاري التحميل...</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">الواجبات</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <ClipboardList className="w-5 h-5" />
            <span>{assignments.length} واجب</span>
          </div>
        </div>

        <div className="space-y-4">
          {assignments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              لا توجد واجبات متاحة
            </div>
          ) : (
            assignments.map(assignment => (
              <article
                key={assignment._id}
                className="bg-card border border-border rounded-xl p-6 card-elevated"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      <ClipboardList className="w-5 h-5 text-accent mt-1" />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground">
                          {assignment.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {assignment.type === 'course' ? 'واجب كورس' : 'واجب عام'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mr-8">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{assignment.timeLimitMin} دقيقة</span>
                      </div>
                      <div>
                        <span>الدرجة: {assignment.totalMarks}</span>
                      </div>
                      <div>
                        <span>{formatDate(assignment.date)}</span>
                      </div>
                      {assignment.mandatoryAttendance && (
                        <div className="flex items-center gap-1 text-accent">
                          <UserCheck className="w-4 h-4" />
                          <span>حضور إجباري</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={() => navigate(`/assignments/${assignment._id}/take`)}>
                      ابدأ الواجب
                    </Button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}