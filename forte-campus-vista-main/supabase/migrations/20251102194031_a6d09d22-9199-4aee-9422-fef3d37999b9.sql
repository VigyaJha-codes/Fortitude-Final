-- Create alerts table for Early Warning System
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  faculty_id UUID REFERENCES public.faculty(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  risk_score NUMERIC(5,2),
  top_drivers JSONB,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create student_subjects table to track which subjects each student is enrolled in
CREATE TABLE IF NOT EXISTS public.student_subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

-- Add experience field to faculty if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'faculty' AND column_name = 'experience') THEN
    ALTER TABLE public.faculty ADD COLUMN experience TEXT;
  END IF;
END $$;

-- Add dob field to students if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'dob') THEN
    ALTER TABLE public.students ADD COLUMN dob DATE;
  END IF;
END $$;

-- Add subject_code to courses if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'subject_name') THEN
    ALTER TABLE public.courses ADD COLUMN subject_name TEXT;
  END IF;
END $$;

-- Enable RLS on alerts
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies for alerts
CREATE POLICY "Students can view their own alerts" 
ON public.alerts FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM students 
    WHERE students.id = alerts.student_id 
    AND students.user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'faculty'::app_role)
);

CREATE POLICY "Faculty and admin can manage alerts" 
ON public.alerts FOR ALL 
USING (
  has_role(auth.uid(), 'faculty'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Enable RLS on student_subjects
ALTER TABLE public.student_subjects ENABLE ROW LEVEL SECURITY;

-- RLS policies for student_subjects
CREATE POLICY "Students can view their own subjects" 
ON public.student_subjects FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM students 
    WHERE students.id = student_subjects.student_id 
    AND students.user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'faculty'::app_role)
);

CREATE POLICY "Admin and faculty can manage student subjects" 
ON public.student_subjects FOR ALL 
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'faculty'::app_role)
);