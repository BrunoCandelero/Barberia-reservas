import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bgtwlqnvwpuzlwvpbebo.supabase.co';

// Tu clave real completa:
const supabaseAnonKey = 'sb_publishable_znMWHVJL0TUm0YGqAXjwIQ_3un_xKyy'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);