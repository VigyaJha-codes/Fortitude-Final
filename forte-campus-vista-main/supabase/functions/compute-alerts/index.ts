import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch all students with their attendance and marks
    const { data: students, error: studentsError } = await supabaseClient
      .from('students')
      .select(`
        id,
        student_id,
        full_name,
        user_id,
        attendance (
          status,
          course_id
        ),
        marks (
          marks_obtained,
          total_marks,
          course_id
        )
      `);

    if (studentsError) throw studentsError;

    const alerts = [];

    for (const student of students || []) {
      // Calculate attendance percentage
      const totalClasses = student.attendance?.length || 0;
      const presentClasses = student.attendance?.filter((a: any) => a.status === 'present').length || 0;
      const attendancePercentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 100;

      // Calculate average marks percentage
      const marksData = student.marks || [];
      const avgMarks = marksData.length > 0
        ? marksData.reduce((sum: number, m: any) => sum + (m.marks_obtained / m.total_marks * 100), 0) / marksData.length
        : 100;

      // Determine risk level
      let riskLevel = 'low';
      let riskScore = 0;
      let reason = '';
      const topDrivers: any[] = [];

      if (attendancePercentage < 50) {
        riskLevel = 'high';
        riskScore = 90;
        reason = 'Critical: Attendance below 50%';
        topDrivers.push({ feature: 'attendance', contribution: 90, value: attendancePercentage });
      } else if (avgMarks < 40) {
        riskLevel = 'high';
        riskScore = 85;
        reason = 'Critical: Average marks below 40%';
        topDrivers.push({ feature: 'marks', contribution: 85, value: avgMarks });
      } else if (attendancePercentage < 70 || avgMarks < 50) {
        riskLevel = 'medium';
        riskScore = 60;
        reason = attendancePercentage < 70 ? 'Attendance below 70%' : 'Average marks below 50%';
        topDrivers.push({ 
          feature: attendancePercentage < 70 ? 'attendance' : 'marks', 
          contribution: 60, 
          value: attendancePercentage < 70 ? attendancePercentage : avgMarks 
        });
      }

      if (riskLevel !== 'low') {
        // Find faculty for this student (get any faculty from their courses)
        const { data: studentCourses } = await supabaseClient
          .from('student_subjects')
          .select('course_id, courses(faculty_id)')
          .eq('student_id', student.id)
          .limit(1)
          .maybeSingle();

        const facultyId = studentCourses?.courses?.[0]?.faculty_id || null;

        alerts.push({
          student_id: student.id,
          faculty_id: facultyId,
          reason,
          risk_level: riskLevel,
          risk_score: riskScore,
          top_drivers: topDrivers,
        });
      }
    }

    // Delete old alerts and insert new ones
    await supabaseClient.from('alerts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (alerts.length > 0) {
      const { error: insertError } = await supabaseClient.from('alerts').insert(alerts);
      if (insertError) throw insertError;
    }

    console.log(`Generated ${alerts.length} alerts`);

    return new Response(
      JSON.stringify({ success: true, alertsGenerated: alerts.length, alerts }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error computing alerts:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});