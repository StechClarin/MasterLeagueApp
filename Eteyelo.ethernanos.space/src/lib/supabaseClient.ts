import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tskaatmquckvuvamymcx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_7EySw7dL-ZndQLvZ0MNoeQ_Ee36OzxT';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
