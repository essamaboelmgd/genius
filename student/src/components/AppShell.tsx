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
            { id: 'courses-new', labelArabic: 'جديدة', icon: BookOpen, path: '/courses/new' },
            { id: 'courses-subscribed', labelArabic: 'مشترك فيها', icon: BookOpen, path: '/courses/subscribed' },
            { id: 'courses-free', labelArabic: 'مجانية', icon: BookOpen, path: '/courses/free' },
          ],
        },
        {
          id: 'exams',
          labelArabic: 'الامتحانات',
          icon: FileText,
          path: '/exams',
          children: [
            { id: 'exams-course', labelArabic: 'امتحانات الكورسات', icon: FileText, path: '/exams/course' },
            { id: 'exams-general', labelArabic: 'امتحانات عامة', icon: FileText, path: '/exams/general' },
          ],
        },
        {
          id: 'assignments',
          labelArabic: 'الواجبات',
          icon: ClipboardCheck,
          path: '/assignments',
        },
        {
          id: 'notes',
          labelArabic: 'المذكرات',
          icon: StickyNote,
          path: '/notes',
        },
        {
          id: 'settings',
          labelArabic: 'الإعدادات',
          icon: Settings,
          path: '/settings',
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