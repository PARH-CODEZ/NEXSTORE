import { createClient } from '@supabase/supabase-js';

// ✅ Replace with your own keys from Supabase → Settings → API
const supabaseUrl = 'https://bvxqstzpkhywnshheuvq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2eHFzdHpwa2h5d25zaGhldXZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzODE5OTksImV4cCI6MjA2ODk1Nzk5OX0.NO_QxbvYkOcxOs4_RyFKnHtadcvR6zYinhEHUj1dpOA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
