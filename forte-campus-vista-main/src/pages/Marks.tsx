import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

export default function Marks() {
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [marks, setMarks] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    exam_type: '',
    marks_obtained: 0,
    total_marks: 100,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchMarks();
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    const { data } = await supabase.from('courses').select('*').order('course_name');
    setCourses(data || []);
  };

  const fetchStudents = async () => {
    const { data } = await supabase.from('students').select('*').order('full_name');
    setStudents(data || []);
  };

  const fetchMarks = async () => {
    const { data } = await supabase
      .from('marks')
      .select('*, students(full_name, student_id)')
      .eq('course_id', selectedCourse)
      .order('created_at', { ascending: false });
    setMarks(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('marks').insert([{
      ...formData,
      course_id: selectedCourse,
    }]);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Marks uploaded successfully' });
      setIsOpen(false);
      fetchMarks();
      setFormData({
        student_id: '',
        exam_type: '',
        marks_obtained: 0,
        total_marks: 100,
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold gradient-text">Marks Management</h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-button" disabled={!selectedCourse}>
                <Plus className="mr-2 h-4 w-4" /> Add Marks
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>Upload Marks</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Select value={formData.student_id} onValueChange={(value) => setFormData({ ...formData, student_id: value })} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.full_name} ({student.student_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input placeholder="Exam Type (e.g., Mid-Term, Final)" value={formData.exam_type} onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })} required />
                <Input type="number" placeholder="Marks Obtained" value={formData.marks_obtained} onChange={(e) => setFormData({ ...formData, marks_obtained: parseFloat(e.target.value) })} required min="0" />
                <Input type="number" placeholder="Total Marks" value={formData.total_marks} onChange={(e) => setFormData({ ...formData, total_marks: parseFloat(e.target.value) })} required min="1" />
                <Button type="submit" className="w-full gradient-button">Upload Marks</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

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

        {selectedCourse && (
          <div className="grid gap-4">
            {marks.map((mark) => (
              <Card key={mark.id} className="glass-card p-6 hover-lift">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">{mark.students?.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{mark.students?.student_id}</p>
                    <p className="text-sm mt-2">{mark.exam_type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold gradient-text">
                      {mark.marks_obtained}/{mark.total_marks}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {((mark.marks_obtained / mark.total_marks) * 100).toFixed(1)}%
                    </p>
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
