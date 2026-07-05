import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const sql = fs.readFileSync('../nordik-gestao/add_estoque_columns.sql', 'utf-8');
  const { error } = await supabase.rpc('exec_sql', { query: sql });
  if (error) {
    console.error('Error executing SQL:', error);
  } else {
    console.log('Success');
  }
}

run();
