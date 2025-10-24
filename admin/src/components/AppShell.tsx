import { ReactNode, useEffect, useState } from 'react';
import { Header } from './Header';
import { Sidebar, SidebarItem } from './Sidebar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  ClipboardCheck,
  StickyNote,
  Settings,
} from 'lucide-react';

interface AppShellProps {
  children: ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>([]);

  useEffect(() => {
    // Only redirect if we're done loading and there's no user
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Set sidebar items when user is available
    if (user) {
      const items: SidebarItem[] = [
        {
          id: 'dashboard',
          labelArabic: 'لوحة التحكم',
          icon: LayoutDashboard,
          path: '/dashboard',
        },
        {
          id: 'courses',
          labelArabic: 'الكورسات',
          icon: BookOpen,
          path: '/courses',
          children: [
            { id: 'manage-courses', labelArabic: 'اداره الكورسات', icon: BookOpen, path: '/courses/manage' },
            { id: 'subscriptions', labelArabic: 'الاشتراكات', icon: BookOpen, path: '/subscriptions' },
          ],
        },
        {
          id: 'exams',
          labelArabic: 'الامتحانات',
          icon: FileText,
          path: '/exams',
          children: [
            { id: 'manage-exams', labelArabic: 'اداره الامتحانات', icon: FileText, path: '/exams/manage' },
            { id: 'exam-grades', labelArabic: 'درجات الامتحانات', icon: FileText, path: '/exams/grades' },
          ],
        },
        {
          id: 'assignments',
          labelArabic: 'الواجبات',
          icon: ClipboardCheck,
          path: '/assignments',
          children: [
            { id: 'manage-assignments', labelArabic: 'اداره الواجبات', icon: ClipboardCheck, path: '/assignments/manage' },
            { id: 'assignment-grades', labelArabic: 'درجات الواجبات', icon: ClipboardCheck, path: '/assignments/grades' },
          ],
        },
        {
          id: 'notes',
          labelArabic: 'المذكرات',
          icon: StickyNote,
          path: '/notes',
          children: [
            { id: 'manage-notes', labelArabic: 'اداره المذكرات', icon: StickyNote, path: '/notes/manage' },
            { id: 'note-requests', labelArabic: 'طلبات المذكرات', icon: StickyNote, path: '/notes/requests' },
          ],
        },
      ];
      
      setSidebarItems(items);
    }
  }, [user]);

  // Show loading state while checking auth
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>;
  }

  // If no user and not loading, render nothing (redirect will happen)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col w-full">
      <Header student={user} />
      <div className="flex flex-1 w-full">
        <Sidebar items={sidebarItems} />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};