import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FACULTY_DATA = [
  { name: "Riya Singh", email: "Fac_riya_1@fortitude.in", password: "riya1", subject: "Machine Learning", contact: "9876543210", experience: "9 years" },
  { name: "Shubham Kumar", email: "Fac_shubham_2@fortitude.in", password: "shubham2", subject: "Artificial Intelligence", contact: "9812345672", experience: "8 years" },
  { name: "Aditi Verma", email: "Fac_aditi_3@fortitude.in", password: "aditi3", subject: "Python Programming", contact: "9923456783", experience: "6 years" },
  { name: "Vikas Mehra", email: "Fac_vikas_4@fortitude.in", password: "vikas4", subject: "Data Structures", contact: "9898765434", experience: "10 years" },
  { name: "Priya Sharma", email: "Fac_priya_5@fortitude.in", password: "priya5", subject: "Linear Algebra", contact: "9765432198", experience: "7 years" },
  { name: "Raghav Joshi", email: "Fac_raghav_6@fortitude.in", password: "raghav6", subject: "Data Science Fundamentals", contact: "9811122233", experience: "7 years" },
  { name: "Sakshi Jain", email: "Fac_sakshi_7@fortitude.in", password: "sakshi7", subject: "Statistics for DS", contact: "9900112233", experience: "6 years" },
  { name: "Manish Patel", email: "Fac_manish_8@fortitude.in", password: "manish8", subject: "Database Systems", contact: "9822334455", experience: "11 years" },
  { name: "Tanvi Rao", email: "Fac_tanvi_9@fortitude.in", password: "tanvi9", subject: "Internet of Things", contact: "9734455667", experience: "5 years" },
  { name: "Karan Desai", email: "Fac_karan_10@fortitude.in", password: "karan10", subject: "Embedded Systems", contact: "9701234567", experience: "9 years" },
  { name: "Meera Nair", email: "Fac_meera_11@fortitude.in", password: "meera11", subject: "Sensor Networks", contact: "9667788990", experience: "6 years" },
  { name: "Rohit Gupta", email: "Fac_rohit_12@fortitude.in", password: "rohit12", subject: "Microcontrollers", contact: "9556677889", experience: "8 years" },
  { name: "Pooja Kapoor", email: "Fac_pooja_13@fortitude.in", password: "pooja13", subject: "Wireless Communication", contact: "9455566677", experience: "7 years" },
  { name: "Anil Kumar", email: "Fac_anil_14@fortitude.in", password: "anil14", subject: "Network Security", contact: "9344455566", experience: "12 years" },
  { name: "Sonia Reddy", email: "Fac_sonia_15@fortitude.in", password: "sonia15", subject: "Ethical Hacking", contact: "9223344556", experience: "6 years" },
  { name: "Vivek Sharma", email: "Fac_vivek_16@fortitude.in", password: "vivek16", subject: "Cryptography", contact: "9112233445", experience: "10 years" },
  { name: "Neha Singh", email: "Fac_neha_17@fortitude.in", password: "neha17", subject: "Cyber Laws", contact: "9001122334", experience: "5 years" },
  { name: "Suresh Rao", email: "Fac_suresh_18@fortitude.in", password: "suresh18", subject: "Operating Systems", contact: "9899001122", experience: "13 years" },
  { name: "Kavita Joshi", email: "Fac_kavita_19@fortitude.in", password: "kavita19", subject: "Web Development", contact: "9778899001", experience: "7 years" },
  { name: "Abhishek Yadav", email: "Fac_abhishek_20@fortitude.in", password: "abhishek20", subject: "Software Engineering", contact: "9665544332", experience: "9 years" },
  { name: "Neelam Patel", email: "Fac_neelam_21@fortitude.in", password: "neelam21", subject: "Cloud Computing", contact: "9554433221", experience: "6 years" },
  { name: "Rakesh Gupta", email: "Fac_rakesh_22@fortitude.in", password: "rakesh22", subject: "Digital Electronics", contact: "9443322110", experience: "11 years" },
  { name: "Hema Nair", email: "Fac_hema_23@fortitude.in", password: "hema23", subject: "Microprocessors", contact: "9332211009", experience: "8 years" },
  { name: "Dinesh Kapoor", email: "Fac_dinesh_24@fortitude.in", password: "dinesh24", subject: "Signal Processing", contact: "9221100998", experience: "12 years" },
  { name: "Maya Iyer", email: "Fac_maya_25@fortitude.in", password: "maya25", subject: "Analog Circuits", contact: "9110099887", experience: "7 years" },
  { name: "Raman Gupta", email: "Fac_raman_26@fortitude.in", password: "raman26", subject: "Control Systems", contact: "9009988776", experience: "10 years" },
  { name: "Pallavi Sharma", email: "Fac_pallavi_27@fortitude.in", password: "pallavi27", subject: "Thermodynamics", contact: "9898877665", experience: "9 years" },
  { name: "Sanjay Singh", email: "Fac_sanjay_28@fortitude.in", password: "sanjay28", subject: "Fluid Mechanics", contact: "9787766554", experience: "11 years" },
  { name: "Lekha Menon", email: "Fac_lekha_29@fortitude.in", password: "lekha29", subject: "Manufacturing Processes", contact: "9666655543", experience: "8 years" },
  { name: "Ajay Rao", email: "Fac_ajay_30@fortitude.in", password: "ajay30", subject: "Machine Design", contact: "9555544332", experience: "12 years" },
  { name: "Geeta Das", email: "Fac_geeta_31@fortitude.in", password: "geeta31", subject: "Engineering Mechanics", contact: "9444433221", experience: "7 years" },
  { name: "Ramesh Kumar", email: "Fac_ramesh_32@fortitude.in", password: "ramesh32", subject: "Structural Engineering", contact: "9333322110", experience: "13 years" },
  { name: "Sunita Verma", email: "Fac_sunita_33@fortitude.in", password: "sunita33", subject: "Building Materials", contact: "9222211009", experience: "6 years" },
  { name: "Dilip Rao", email: "Fac_dilip_34@fortitude.in", password: "dilip34", subject: "Environmental Engineering", contact: "9111100998", experience: "9 years" },
  { name: "Nitin Sharma", email: "Fac_nitin_35@fortitude.in", password: "nitin35", subject: "Surveying", contact: "9000099887", experience: "8 years" },
  { name: "Usha Patel", email: "Fac_usha_36@fortitude.in", password: "usha36", subject: "Power Systems", contact: "9890008776", experience: "11 years" },
  { name: "Varun Kapoor", email: "Fac_varun_37@fortitude.in", password: "varun37", subject: "Electrical Machines", contact: "9780006554", experience: "10 years" },
  { name: "Bhavna Jain", email: "Fac_bhavna_38@fortitude.in", password: "bhavna38", subject: "Circuit Theory", contact: "9660005543", experience: "9 years" },
  { name: "Pankaj Kumar", email: "Fac_pankaj_39@fortitude.in", password: "pankaj39", subject: "Renewable Energy Sources", contact: "9550004332", experience: "7 years" },
  { name: "Rekha Nair", email: "Fac_rekha_40@fortitude.in", password: "rekha40", subject: "Surveying (Civil)", contact: "9440003221", experience: "8 years" }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { studentsData } = await req.json();

    console.log('Starting data seeding process...');
    const results = {
      faculty: { created: 0, errors: [] as string[] },
      students: { created: 0, errors: [] as string[] },
      courses: { created: 0, errors: [] as string[] },
      enrollments: { created: 0, errors: [] as string[] },
      marks: { created: 0, errors: [] as string[] },
      attendance: { created: 0, errors: [] as string[] },
    };

    // Step 1: Create faculty users and records
    console.log('Creating faculty...');
    const facultyMap = new Map();
    
    for (const fac of FACULTY_DATA) {
      try {
        // Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: fac.email,
          password: fac.password,
          email_confirm: true,
          user_metadata: { full_name: fac.name, role: 'faculty' }
        });

        if (authError) throw authError;

        // Create faculty record
        const { data: facultyData, error: facultyError } = await supabaseAdmin
          .from('faculty')
          .insert({
            user_id: authData.user.id,
            faculty_id: `FAC${String(FACULTY_DATA.indexOf(fac) + 1).padStart(3, '0')}`,
            full_name: fac.name,
            email: fac.email,
            phone: fac.contact,
            department: 'Engineering',
            designation: 'Professor',
            specialization: fac.subject,
            experience: fac.experience
          })
          .select()
          .single();

        if (facultyError) throw facultyError;

        // Add faculty role
        await supabaseAdmin.from('user_roles').insert({
          user_id: authData.user.id,
          role: 'faculty'
        });

        facultyMap.set(fac.subject, facultyData.id);
        results.faculty.created++;
      } catch (error: any) {
        results.faculty.errors.push(`${fac.name}: ${error.message}`);
      }
    }

    // Step 2: Create courses
    console.log('Creating courses...');
    const courseMap = new Map();
    
    for (const [subject, facultyId] of facultyMap.entries()) {
      try {
        const { data: courseData, error: courseError } = await supabaseAdmin
          .from('courses')
          .insert({
            course_code: `COURSE_${subject.replace(/\s+/g, '_').toUpperCase()}`,
            course_name: subject,
            subject_name: subject,
            department: 'Engineering',
            semester: 1,
            credits: 4,
            faculty_id: facultyId
          })
          .select()
          .single();

        if (courseError) throw courseError;
        courseMap.set(subject, courseData.id);
        results.courses.created++;
      } catch (error: any) {
        results.courses.errors.push(`${subject}: ${error.message}`);
      }
    }

    // Step 3: Create students
    console.log('Creating students...');
    
    for (const student of studentsData || []) {
      try {
        // Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: student.email,
          password: student.password,
          email_confirm: true,
          user_metadata: { full_name: student.name, role: 'student' }
        });

        if (authError) throw authError;

        // Parse year to semester
        const yearMapping: any = {
          'First Year': 2,
          'Second Year': 4,
          'Third Year': 6,
          'Final Year': 8
        };

        // Create student record
        const { data: studentData, error: studentError } = await supabaseAdmin
          .from('students')
          .insert({
            user_id: authData.user.id,
            student_id: student.roll_no,
            full_name: student.name,
            email: student.email,
            phone: '9999999999',
            department: student.course,
            semester: yearMapping[student.year] || 1,
            enrollment_year: 2022,
            cgpa: student.cgpa,
            dob: student.dob.split('-').reverse().join('-') // Convert DD-MM-YYYY to YYYY-MM-DD
          })
          .select()
          .single();

        if (studentError) throw studentError;

        // Add student role
        await supabaseAdmin.from('user_roles').insert({
          user_id: authData.user.id,
          role: 'student'
        });

        // Step 4: Enroll student in subjects and add marks/attendance
        for (const [subjectName, subjectData] of Object.entries(student.subjects || {})) {
          const courseId = courseMap.get(subjectName);
          if (!courseId) continue;

          try {
            // Enroll in course
            await supabaseAdmin.from('student_subjects').insert({
              student_id: studentData.id,
              course_id: courseId
            });
            results.enrollments.created++;

            // Add marks
            const marks: any = subjectData;
            await supabaseAdmin.from('marks').insert({
              student_id: studentData.id,
              course_id: courseId,
              exam_type: 'Semester',
              marks_obtained: marks.Total,
              total_marks: 100,
              uploaded_by: null
            });
            results.marks.created++;

            // Add attendance (create 10 attendance records based on percentage)
            const attendancePercent = marks.Attendance;
            const totalClasses = 10;
            const presentClasses = Math.round((attendancePercent / 100) * totalClasses);
            
            for (let i = 0; i < totalClasses; i++) {
              const date = new Date();
              date.setDate(date.getDate() - (totalClasses - i));
              
              await supabaseAdmin.from('attendance').insert({
                student_id: studentData.id,
                course_id: courseId,
                date: date.toISOString().split('T')[0],
                status: i < presentClasses ? 'present' : 'absent',
                marked_by: null
              });
            }
            results.attendance.created += totalClasses;
          } catch (error: any) {
            console.error(`Error enrolling ${student.name} in ${subjectName}:`, error.message);
          }
        }

        results.students.created++;
      } catch (error: any) {
        results.students.errors.push(`${student.name}: ${error.message}`);
      }
    }

    console.log('Data seeding completed!', results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Seeding error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});