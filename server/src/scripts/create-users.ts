
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const users = [
    { email: 'isaquephputumuju@gmail.com', password: 'alves@fncd', role: 'Consultor' },
    { email: 'atualzdev@gmail.com', password: 'alves@fncd', role: 'Cliente' }
];

async function createUsers() {
    for (const user of users) {
        console.log(`\nProcessing ${user.role}: ${user.email}`);

        const { data, error } = await supabase.auth.signUp({
            email: user.email,
            password: user.password,
        });

        if (error) {
            console.error(`Error creating ${user.email}:`, error.message);
        } else if (data.user) {
            console.log(`SUCCESS: ${user.role} created. ID: ${data.user.id}`);
        } else {
            console.log(`Pending confirmation (or error) for ${user.email}`);
        }
    }
}

createUsers();
