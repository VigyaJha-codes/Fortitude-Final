import { ReactNode } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/button';
import { GraduationCap, LogOut, LayoutDashboard, Users, GraduationCap as GraduationCapIcon, BookOpen, Calendar, FileText, Bell, BarChart3 } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'faculty', 'student'] },
    { path: '/students', icon: Users, label: 'Students', roles: ['admin', 'faculty'] },
    { path: '/faculty', icon: GraduationCapIcon, label: 'Faculty', roles: ['admin'] },
    { path: '/courses', icon: BookOpen, label: 'Courses', roles: ['admin'] },
    { path: '/my-subjects', icon: BookOpen, label: 'My Subjects', roles: ['student'] },
    { path: '/attendance', icon: Calendar, label: 'Attendance', roles: ['admin', 'faculty', 'student'] },
    { path: '/marks', icon: FileText, label: 'Marks', roles: ['admin', 'faculty', 'student'] },
    { path: '/notices', icon: Bell, label: 'Notices', roles: ['admin', 'faculty', 'student'] },
    { path: '/alerts', icon: Bell, label: 'Early Alerts', roles: ['admin', 'faculty', 'student'] },
    { path: '/analytics', icon: BarChart3, label: 'Analytics', roles: ['admin'] },
  ];

  const visibleNavItems = navItems.filter(item => userRole && item.roles.includes(userRole));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 glass-card backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">Fortitude</h1>
              {userRole && (
                <p className="text-xs text-muted-foreground capitalize">
                  {userRole} Portal
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="glass"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </header>
      
      <div className="flex">
        <aside className="glass-card w-64 min-h-[calc(100vh-4rem)] border-r p-4">
          <nav className="space-y-2">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover-lift ${
                    isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
        
        <main className="flex-1 container px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
};
