import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Check, X } from 'lucide-react';

export default function Attendance() {
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchStudents();
      fetchAttendance();
    }
  }, [selectedCourse, selectedDate]);

  const fetchCourses = async () => {
    const { data } = await supabase.from('courses').select('*').order('course_name');
    setCourses(data || []);
  };

  const fetchStudents = async () => {
    const { data } = await supabase.from('students').select('*').order('full_name');
    setStudents(data || []);
  };

  const fetchAttendance = async () => {
    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('course_id', selectedCourse)
      .eq('date', format(selectedDate, 'yyyy-MM-dd'));
    
    const attendanceMap: Record<string, string> = {};
    data?.forEach((record) => {
      attendanceMap[record.student_id] = record.status;
    });
    setAttendance(attendanceMap);
  };

  const markAttendance = async (studentId: string, status: string) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const { data: existing } = await supabase
      .from('attendance')
      .select('id')
      .eq('student_id', studentId)
      .eq('course_id', selectedCourse)
      .eq('date', dateStr)
      .maybeSingle();

    if (existing) {
      await supabase.from('attendance').update({ status }).eq('id', existing.id);
    } else {
      await supabase.from('attendance').insert([{
        student_id: studentId,
        course_id: selectedCourse,
        date: dateStr,
        status,
      }]);
    }

    setAttendance({ ...attendance, [studentId]: status });
    toast({ title: 'Success', description: 'Attendance marked' });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold gradient-text">Attendance Management</h1>

        <div className="flex gap-4 items-center flex-wrap">
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select Course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.course_code} - {course.course_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-64">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={selectedDate} onSelect={(date) => date && setSelectedDate(date)} />
            </PopoverContent>
          </Popover>
        </div>

        {selectedCourse && (
          <div className="space-y-4">
            {students.map((student) => (
              <Card key={student.id} className="glass-card p-6 hover-lift">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">{student.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{student.student_id}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={attendance[student.id] === 'present' ? 'default' : 'outline'}
                      onClick={() => markAttendance(student.id, 'present')}
                      className="bg-success"
                    >
                      <Check className="h-4 w-4 mr-2" /> Present
                    </Button>
                    <Button
                      variant={attendance[student.id] === 'absent' ? 'default' : 'outline'}
                      onClick={() => markAttendance(student.id, 'absent')}
                      className="bg-error"
                    >
                      <X className="h-4 w-4 mr-2" /> Absent
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
