import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lursrpxvzrynibdpezme.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1cnNycHh2enJ5bmliZHBlem1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MzI5NDQsImV4cCI6MjA5NjEwODk0NH0.6Taso0ye8Bnl8ixDGTeuUrx9kj2bi61iqXxGFdCtuqg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Fetching barbeiros...');
  const { data, error } = await supabase.from('barbeiros').select('*');
  console.log('Data:', data);
  console.log('Error:', error);
}

test();
