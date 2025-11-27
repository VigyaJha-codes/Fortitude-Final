import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, ClipboardCheck, TrendingUp, Bell, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    students: 0,
    faculty: 0,
    courses: 0,
    notices: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [studentsRes, facultyRes, coursesRes, noticesRes] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('faculty').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('notices').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        students: studentsRes.count || 0,
        faculty: facultyRes.count || 0,
        courses: coursesRes.count || 0,
        notices: noticesRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Students',
      value: stats.students,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Faculty Members',
      value: stats.faculty,
      icon: Award,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Active Courses',
      value: stats.courses,
      icon: BookOpen,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
    {
      title: 'Recent Notices',
      value: stats.notices,
      icon: Bell,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
  ];

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold gradient-text mb-2">
            Welcome to Fortitude
          </h2>
          <p className="text-muted-foreground">
            {userRole === 'admin' && 'Manage your institution with powerful tools and insights.'}
            {userRole === 'faculty' && 'Track student progress and manage your courses effectively.'}
            {userRole === 'student' && 'View your academic progress and stay updated with notices.'}
          </p>
        </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card
            key={stat.title}
            className="glass-card hover-lift transition-smooth cursor-pointer"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => {
              if (stat.title === 'Total Students') navigate('/students');
              else if (stat.title === 'Faculty Members') navigate('/faculty');
              else if (stat.title === 'Active Courses') navigate('/courses');
              else if (stat.title === 'Recent Notices') navigate('/notices');
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${stat.color}`}>
                {loading ? '...' : stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Click to view details</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-analytics" />
              AI Insights
            </CardTitle>
            <CardDescription>
              Predictive analytics and performance tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Get AI-powered insights on student performance, attendance patterns, and risk assessment.
            </p>
            {(userRole === 'admin' || userRole === 'faculty') && (
              <Button className="btn-gradient-primary" onClick={() => navigate('/analytics')}>
                View Analytics
              </Button>
            )}
            {userRole === 'student' && (
              <Button className="btn-gradient-primary" onClick={() => navigate('/alerts')}>
                View My Alerts
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-info" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {userRole === 'admin' && (
              <>
                <Button variant="outline" className="w-full justify-start glass" onClick={() => navigate('/students')}>
                  Manage Students
                </Button>
                <Button variant="outline" className="w-full justify-start glass" onClick={() => navigate('/faculty')}>
                  Manage Faculty
                </Button>
                <Button variant="outline" className="w-full justify-start glass" onClick={() => navigate('/alerts')}>
                  View Early Alerts
                </Button>
              </>
            )}
            {userRole === 'faculty' && (
              <>
                <Button variant="outline" className="w-full justify-start glass" onClick={() => navigate('/attendance')}>
                  Mark Attendance
                </Button>
                <Button variant="outline" className="w-full justify-start glass" onClick={() => navigate('/marks')}>
                  Upload Marks
                </Button>
                <Button variant="outline" className="w-full justify-start glass" onClick={() => navigate('/alerts')}>
                  View Student Alerts
                </Button>
              </>
            )}
            {userRole === 'student' && (
              <>
                <Button variant="outline" className="w-full justify-start glass" onClick={() => navigate('/my-subjects')}>
                  My Subjects
                </Button>
                <Button variant="outline" className="w-full justify-start glass" onClick={() => navigate('/attendance')}>
                  View Attendance
                </Button>
                <Button variant="outline" className="w-full justify-start glass" onClick={() => navigate('/marks')}>
                  Check Marks
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </Layout>
  );
};

export default Dashboard;
