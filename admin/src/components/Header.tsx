import { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, Settings, LogOut } from 'lucide-react';
import { Avatar } from './Avatar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

interface HeaderProps {
  student: any; // We'll use the student prop but rely on auth context for real data
}

export const Header = ({ student }: HeaderProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user?.id]);

  const loadNotifications = async () => {
    try {
      const response = await api.get(`/notifications`);
      setNotifications(response.data.data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowProfileMenu(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatTime = (time: string) => {
    const date = new Date(time);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    return `منذ ${diffDays} يوم`;
  };

  // Use the real user data from context instead of mock data
  const currentUser = user || student;

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border h-16 px-4 md:px-6">
      <div className="flex items-center justify-between h-full max-w-7xl mx-auto">
        {/* Logo - Left side (visual) */}
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-primary">genius</div>
          <div className="text-xs text-muted-foreground">منصة تعليمية</div>
        </div>

        {/* User actions - Right side (RTL) */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-muted rounded-lg transition-smooth"
              aria-label="الإشعارات"
            >
              <Bell className="w-5 h-5 text-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-1 left-1 w-2 h-2 bg-danger rounded-full"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute left-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-lg overflow-hidden transition-modal z-50">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold text-foreground">الإشعارات</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">لا توجد إشعارات</div>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        className={`p-4 border-b border-border hover:bg-muted transition-smooth cursor-pointer ${
                          !notif.read ? 'bg-muted/50' : ''
                        }`}
                        onClick={async () => {
                          if (!notif.read) {
                            try {
                              await api.patch(`/notifications/${notif.id}`, { read: true });
                              loadNotifications();
                            } catch (error) {
                              console.error('Error marking notification as read:', error);
                            }
                          }
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-foreground">{notif.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                          </div>
                          {!notif.read && (
                            <div className="w-2 h-2 bg-accent rounded-full mt-1"></div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{formatTime(notif.time)}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg transition-smooth"
              aria-label="القائمة الشخصية"
              aria-expanded={showProfileMenu}
            >
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground hidden md:block">{currentUser?.name}</span>
              <Avatar gender={currentUser?.gender} size="sm" />
            </button>

            {showProfileMenu && (
              <div className="absolute left-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg overflow-hidden transition-modal z-50">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-smooth text-foreground"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">الإعدادات</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-smooth text-danger"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">تسجيل خروج</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};