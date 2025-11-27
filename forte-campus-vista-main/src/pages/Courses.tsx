import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Course {
  id: string;
  course_code: string;
  course_name: string;
  department: string;
  semester: number;
  credits: number;
  faculty_id: string | null;
  faculty?: { full_name: string };
}

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [faculty, setFaculty] = useState<{ id: string; full_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    course_code: '',
    course_name: '',
    department: '',
    semester: 1,
    credits: 3,
    faculty_id: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
    fetchFaculty();
  }, []);

  const fetchCourses = async () => {
    const { data, error } = await supabase.from('courses').select('*, faculty(full_name)').order('course_name');
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setCourses(data || []);
    }
    setLoading(false);
  };

  const fetchFaculty = async () => {
    const { data } = await supabase.from('faculty').select('id, full_name').order('full_name');
    setFaculty(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, faculty_id: formData.faculty_id || null };
    if (editingId) {
      const { error } = await supabase.from('courses').update(payload).eq('id', editingId);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Course updated successfully' });
        setIsOpen(false);
        setEditingId(null);
        fetchCourses();
      }
    } else {
      const { error } = await supabase.from('courses').insert([payload]);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Course added successfully' });
        setIsOpen(false);
        fetchCourses();
      }
    }
    setFormData({
      course_code: '',
      course_name: '',
      department: '',
      semester: 1,
      credits: 3,
      faculty_id: '',
    });
  };

  const handleEdit = (course: Course) => {
    setEditingId(course.id);
    setFormData({
      course_code: course.course_code,
      course_name: course.course_name,
      department: course.department,
      semester: course.semester,
      credits: course.credits,
      faculty_id: course.faculty_id || '',
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Course deleted successfully' });
      fetchCourses();
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold gradient-text">Course Management</h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-button">
                <Plus className="mr-2 h-4 w-4" /> Add Course
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Course' : 'Add New Course'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input placeholder="Course Code" value={formData.course_code} onChange={(e) => setFormData({ ...formData, course_code: e.target.value })} required />
                <Input placeholder="Course Name" value={formData.course_name} onChange={(e) => setFormData({ ...formData, course_name: e.target.value })} required />
                <Input placeholder="Department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} required />
                <Input type="number" placeholder="Semester" value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })} required min="1" max="8" />
                <Input type="number" placeholder="Credits" value={formData.credits} onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })} required min="1" max="6" />
                <Select value={formData.faculty_id} onValueChange={(value) => setFormData({ ...formData, faculty_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculty.map((fac) => (
                      <SelectItem key={fac.id} value={fac.id}>{fac.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit" className="w-full gradient-button">{editingId ? 'Update' : 'Add'} Course</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {courses.map((course) => (
              <Card key={course.id} className="glass-card p-6 hover-lift">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{course.course_name}</h3>
                    <p className="text-muted-foreground">{course.course_code}</p>
                    <p className="text-sm">🏢 {course.department}</p>
                    <p className="text-sm">📚 Semester {course.semester} • {course.credits} Credits</p>
                    {course.faculty && <p className="text-sm">👨‍🏫 {course.faculty.full_name}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(course)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(course.id)}>
                      <Trash2 className="h-4 w-4" />
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
