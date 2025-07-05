import { createClient } from '@supabase/supabase-js';

export const supabaseWalletApi = createClient(
  'https://hxqlhqyvoarlbcljjtgn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4cWxocXl2b2FybGJjbGpqdGduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2ODg2NDAsImV4cCI6MjA1NzI2NDY0MH0.WdLrVvyYDtll3usRyX0-84ZLjaGs1zf7f7wI46Sz3xo'
); 