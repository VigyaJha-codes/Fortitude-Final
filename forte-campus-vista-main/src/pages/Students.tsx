import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Student {
  id: string;
  student_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  department: string;
  semester: number;
  enrollment_year: number;
  cgpa: number | null;
  attendance_percentage: number | null;
}

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    student_id: '',
    full_name: '',
    email: '',
    phone: '',
    department: '',
    semester: 1,
    enrollment_year: new Date().getFullYear(),
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const { data, error } = await supabase.from('students').select('*').order('full_name');
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setStudents(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const { error } = await supabase.from('students').update(formData).eq('id', editingId);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Student updated successfully' });
        setIsOpen(false);
        setEditingId(null);
        fetchStudents();
      }
    } else {
      const { error } = await supabase.from('students').insert([formData]);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Student added successfully' });
        setIsOpen(false);
        fetchStudents();
      }
    }
    setFormData({
      student_id: '',
      full_name: '',
      email: '',
      phone: '',
      department: '',
      semester: 1,
      enrollment_year: new Date().getFullYear(),
    });
  };

  const handleEdit = (student: Student) => {
    setEditingId(student.id);
    setFormData({
      student_id: student.student_id,
      full_name: student.full_name,
      email: student.email,
      phone: student.phone || '',
      department: student.department,
      semester: student.semester,
      enrollment_year: student.enrollment_year,
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Student deleted successfully' });
      fetchStudents();
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold gradient-text">Student Management</h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-button">
                <Plus className="mr-2 h-4 w-4" /> Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Student' : 'Add New Student'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input placeholder="Student ID" value={formData.student_id} onChange={(e) => setFormData({ ...formData, student_id: e.target.value })} required />
                <Input placeholder="Full Name" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
                <Input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                <Input placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                <Input placeholder="Department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} required />
                <Input type="number" placeholder="Semester" value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })} required min="1" max="8" />
                <Input type="number" placeholder="Enrollment Year" value={formData.enrollment_year} onChange={(e) => setFormData({ ...formData, enrollment_year: parseInt(e.target.value) })} required />
                <Button type="submit" className="w-full gradient-button">{editingId ? 'Update' : 'Add'} Student</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="grid gap-4">
            {students.map((student) => (
              <Card key={student.id} className="glass-card p-6 hover-lift">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{student.full_name}</h3>
                    <p className="text-muted-foreground">ID: {student.student_id}</p>
                    <p className="text-sm">📧 {student.email}</p>
                    <p className="text-sm">🎓 {student.department} - Semester {student.semester}</p>
                    <p className="text-sm">📅 Enrolled: {student.enrollment_year}</p>
                    {student.cgpa && <p className="text-sm">📊 CGPA: {student.cgpa}</p>}
                    {student.attendance_percentage && <p className="text-sm">📈 Attendance: {student.attendance_percentage}%</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(student)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(student.id)}>
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
