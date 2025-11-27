import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Faculty {
  id: string;
  faculty_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  department: string;
  designation: string;
  specialization: string | null;
}

export default function Faculty() {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    faculty_id: '',
    full_name: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    specialization: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    const { data, error } = await supabase.from('faculty').select('*').order('full_name');
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setFaculty(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const { error } = await supabase.from('faculty').update(formData).eq('id', editingId);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Faculty updated successfully' });
        setIsOpen(false);
        setEditingId(null);
        fetchFaculty();
      }
    } else {
      const { error } = await supabase.from('faculty').insert([formData]);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Faculty added successfully' });
        setIsOpen(false);
        fetchFaculty();
      }
    }
    setFormData({
      faculty_id: '',
      full_name: '',
      email: '',
      phone: '',
      department: '',
      designation: '',
      specialization: '',
    });
  };

  const handleEdit = (fac: Faculty) => {
    setEditingId(fac.id);
    setFormData({
      faculty_id: fac.faculty_id,
      full_name: fac.full_name,
      email: fac.email,
      phone: fac.phone || '',
      department: fac.department,
      designation: fac.designation,
      specialization: fac.specialization || '',
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this faculty member?')) return;
    const { error } = await supabase.from('faculty').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Faculty deleted successfully' });
      fetchFaculty();
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold gradient-text">Faculty Management</h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-button">
                <Plus className="mr-2 h-4 w-4" /> Add Faculty
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Faculty' : 'Add New Faculty'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input placeholder="Faculty ID" value={formData.faculty_id} onChange={(e) => setFormData({ ...formData, faculty_id: e.target.value })} required />
                <Input placeholder="Full Name" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
                <Input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                <Input placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                <Input placeholder="Department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} required />
                <Input placeholder="Designation" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} required />
                <Input placeholder="Specialization" value={formData.specialization} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} />
                <Button type="submit" className="w-full gradient-button">{editingId ? 'Update' : 'Add'} Faculty</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="grid gap-4">
            {faculty.map((fac) => (
              <Card key={fac.id} className="glass-card p-6 hover-lift">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{fac.full_name}</h3>
                    <p className="text-muted-foreground">ID: {fac.faculty_id}</p>
                    <p className="text-sm">📧 {fac.email}</p>
                    <p className="text-sm">🏢 {fac.department}</p>
                    <p className="text-sm">👔 {fac.designation}</p>
                    {fac.specialization && <p className="text-sm">🎯 {fac.specialization}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(fac)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(fac.id)}>
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
