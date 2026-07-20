-- Migration for HealthOS Patient Clinical History (Sprint 2)
CREATE TABLE IF NOT EXISTS clinical_histories (
  patient_id TEXT PRIMARY KEY,
  -- Medical History fields
  medical_conditions TEXT,
  medications TEXT,
  allergies TEXT,
  smoking_status TEXT,
  pregnancy TEXT,
  blood_pressure TEXT,
  diabetes TEXT,
  cardiac_history TEXT,
  medical_notes TEXT,
  -- Dental History fields
  chief_complaint TEXT,
  prev_dental_treatment TEXT,
  prev_prosthodontic_treatment TEXT,
  implant_history TEXT,
  oral_hygiene_assessment TEXT,
  caries_risk TEXT,
  periodontal_status TEXT,
  occlusion_notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS and add public/anonymous/authenticated policies
ALTER TABLE clinical_histories ENABLE ROW LEVEL SECURITY;

-- Creating permissive policies for easy client-side operations in preview environments
DROP POLICY IF EXISTS "Allow select for all" ON clinical_histories;
CREATE POLICY "Allow select for all" ON clinical_histories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert for all" ON clinical_histories;
CREATE POLICY "Allow insert for all" ON clinical_histories FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update for all" ON clinical_histories;
CREATE POLICY "Allow update for all" ON clinical_histories FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete for all" ON clinical_histories;
CREATE POLICY "Allow delete for all" ON clinical_histories FOR DELETE USING (true);
