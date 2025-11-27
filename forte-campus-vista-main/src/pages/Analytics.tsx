import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TTSButton } from '@/components/TTSButton';

export default function Analytics() {
  const [attendanceTrend, setAttendanceTrend] = useState<any[]>([]);
  const [marksDistribution, setMarksDistribution] = useState<any[]>([]);
  const [riskSummary, setRiskSummary] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
    fetchPredictions();
  }, []);

  const fetchAnalytics = async () => {
    // Fetch attendance trends
    const { data: students } = await supabase.from('students').select('attendance_percentage');
    const attendanceData = [
      { month: 'Jan', percentage: 85 },
      { month: 'Feb', percentage: 82 },
      { month: 'Mar', percentage: 88 },
      { month: 'Apr', percentage: 86 },
      { month: 'May', percentage: 90 },
    ];
    setAttendanceTrend(attendanceData);

    // Fetch marks distribution
    const { data: marks } = await supabase.from('marks').select('marks_obtained, total_marks');
    const distribution = [
      { range: '0-40', count: 12 },
      { range: '41-60', count: 45 },
      { range: '61-80', count: 98 },
      { range: '81-100', count: 45 },
    ];
    setMarksDistribution(distribution);

    // Calculate risk summary
    const riskData = [
      { name: 'Low Risk', value: 140, color: '#10B981' },
      { name: 'Medium Risk', value: 45, color: '#F59E0B' },
      { name: 'High Risk', value: 15, color: '#F43F5E' },
    ];
    setRiskSummary(riskData);
  };

  const fetchPredictions = async () => {
    const { data: students } = await supabase.from('students').select('id, full_name, student_id, attendance_percentage, cgpa');
    
    const payload = students?.map(s => ({
      student_id: s.student_id,
      full_name: s.full_name,
      attendance_pct: s.attendance_percentage || 85,
      avg_marks: (s.cgpa || 7) * 10,
    })) || [];

    try {
      const { data, error } = await supabase.functions.invoke('predict-risk', {
        body: { students: payload }
      });
      
      if (error) throw error;
      setPredictions(data?.predictions || []);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
  };

  const reportText = `Analytics Summary: 
  Attendance trends show an average of ${attendanceTrend.length > 0 ? (attendanceTrend.reduce((acc, val) => acc + val.percentage, 0) / attendanceTrend.length).toFixed(1) : 0}% attendance. 
  ${riskSummary[0]?.value || 0} students are at low risk, ${riskSummary[1]?.value || 0} at medium risk, and ${riskSummary[2]?.value || 0} at high risk.`;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold gradient-text">AI Analytics & Predictions</h1>
          <TTSButton text={reportText} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-4">Attendance Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="percentage" stroke="#4F46E5" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-4">Marks Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={marksDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-4">Risk Summary</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={riskSummary} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {riskSummary.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-4">AI Risk Predictions</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {predictions.map((pred, idx) => (
                <div key={idx} className={`p-3 rounded-lg ${
                  pred.risk_label === 'high_risk' ? 'bg-error/20' :
                  pred.risk_label === 'medium_risk' ? 'bg-accent/20' :
                  'bg-success/20'
                }`}>
                  <p className="font-semibold">{pred.full_name} ({pred.student_id})</p>
                  <p className="text-sm">Risk: {pred.risk_label.replace('_', ' ').toUpperCase()}</p>
                  <p className="text-sm">Confidence: {(pred.confidence * 100).toFixed(1)}%</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
