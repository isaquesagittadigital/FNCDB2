
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from server/.env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Using the key we have (Anon)

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdmin() {
    const email = 'samuel.alves@fncd.com.br';
    const password = 'alves@fncd';

    console.log(`Signing up user: ${email}`);

    // 1. Sign Up (Client side creation)
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        console.error('Error signing up:', error.message);
        // If user already exists, we might want to proceed to update profile
        if (!error.message.includes('already registered')) {
            return;
        }
    }

    if (data.user) {
        console.log(`User created/found. ID: ${data.user.id}`);
        // We will handle profile creation and confirmation via SQL in the next step
        // to bypass RLS/Permission issues with the Anon Key.
        console.log('Use this ID for SQL operations if needed.');
    } else {
        console.log('No user returned (maybe email confirmation pending).');
    }
}

createAdmin();
