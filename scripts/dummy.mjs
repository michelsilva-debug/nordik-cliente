import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://lursrpxvzrynibdpezme.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1cnNycHh2enJ5bmliZHBlem1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MzI5NDQsImV4cCI6MjA5NjEwODk0NH0.6Taso0ye8Bnl8ixDGTeuUrx9kj2bi61iqXxGFdCtuqg'
);

// We'll write the script that generates the SQL, which the user can copy.
