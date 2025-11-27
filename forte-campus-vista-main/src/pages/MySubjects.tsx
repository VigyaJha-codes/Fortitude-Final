import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, User, TrendingUp, AlertTriangle } from 'lucide-react';

interface SubjectData {
  course_id: string;
  course_name: string;
  course_code: string;
  faculty_name: string;
  internal_marks: number;
  external_marks: number;
  total_marks: number;
  attendance_percentage: number;
}

export default function MySubjects() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMySubjects();
  }, [user]);

  const fetchMySubjects = async () => {
    try {
      // Get current student's ID
      const { data: studentData } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (!studentData) {
        toast({ title: 'Error', description: 'Student record not found', variant: 'destructive' });
        setLoading(false);
        return;
      }

      // Get enrolled subjects with marks and attendance
      const { data: enrollments } = await supabase
        .from('student_subjects')
        .select(`
          course_id,
          courses (
            course_name,
            course_code,
            faculty (
              full_name
            )
          )
        `)
        .eq('student_id', studentData.id);

      const subjectList: SubjectData[] = [];

      for (const enrollment of enrollments || []) {
        // Get marks for this course
        const { data: marksData } = await supabase
          .from('marks')
          .select('marks_obtained, total_marks')
          .eq('student_id', studentData.id)
          .eq('course_id', enrollment.course_id)
          .maybeSingle();

        // Get attendance for this course
        const { data: attendanceData } = await supabase
          .from('attendance')
          .select('status')
          .eq('student_id', studentData.id)
          .eq('course_id', enrollment.course_id);

        const totalClasses = attendanceData?.length || 0;
        const presentClasses = attendanceData?.filter((a: any) => a.status === 'present').length || 0;
        const attendancePercentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;

        const course: any = enrollment.courses;
        const faculty: any = course?.faculty;

        // Calculate internal and external from total (assuming 30% internal, 70% external)
        const totalMarks = marksData?.marks_obtained || 0;
        const maxMarks = marksData?.total_marks || 100;
        const percentage = (totalMarks / maxMarks) * 100;
        const internal = Math.round(percentage * 0.3);
        const external = Math.round(percentage * 0.7);

        subjectList.push({
          course_id: enrollment.course_id,
          course_name: course?.course_name || 'Unknown',
          course_code: course?.course_code || 'N/A',
          faculty_name: faculty?.full_name || 'Not assigned',
          internal_marks: internal,
          external_marks: external,
          total_marks: totalMarks,
          attendance_percentage: Math.round(attendancePercentage),
        });
      }

      setSubjects(subjectList);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getAlertStatus = (marks: number, attendance: number) => {
    if (marks < 50 || attendance < 50) {
      return { color: 'text-destructive', icon: AlertTriangle, message: '⚠️ Needs Attention' };
    }
    return { color: 'text-success', icon: TrendingUp, message: '✅ Good Progress' };
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold gradient-text mb-2">My Subjects</h2>
          <p className="text-muted-foreground">
            View your enrolled subjects, marks, and attendance
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading your subjects...</div>
        ) : subjects.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Subjects Found</h3>
              <p className="text-muted-foreground">
                You are not enrolled in any subjects yet. Please contact your admin.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject, index) => {
              const alert = getAlertStatus(subject.total_marks, subject.attendance_percentage);
              const AlertIcon = alert.icon;

              return (
                <Card
                  key={subject.course_id}
                  className="glass-card hover-lift transition-smooth"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{subject.course_name}</CardTitle>
                        <CardDescription>{subject.course_code}</CardDescription>
                      </div>
                      <AlertIcon className={`w-5 h-5 ${alert.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>{subject.faculty_name}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Internal (30):</span>
                        <span className={`font-semibold ${subject.internal_marks < 15 ? 'text-destructive' : ''}`}>
                          {subject.internal_marks}/30
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>External (70):</span>
                        <span className={`font-semibold ${subject.external_marks < 35 ? 'text-destructive' : ''}`}>
                          {subject.external_marks}/70
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-bold pt-2 border-t">
                        <span>Total (100):</span>
                        <span className={subject.total_marks < 50 ? 'text-destructive' : 'text-success'}>
                          {subject.total_marks}/100
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center text-sm">
                        <span>Attendance:</span>
                        <span className={`font-semibold ${subject.attendance_percentage < 50 ? 'text-destructive' : subject.attendance_percentage < 75 ? 'text-warning' : 'text-success'}`}>
                          {subject.attendance_percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mt-2">
                        <div
                          className={`h-2 rounded-full ${subject.attendance_percentage < 50 ? 'bg-destructive' : subject.attendance_percentage < 75 ? 'bg-warning' : 'bg-success'}`}
                          style={{ width: `${subject.attendance_percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className={`text-xs ${alert.color} flex items-center gap-1`}>
                      {alert.message}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}