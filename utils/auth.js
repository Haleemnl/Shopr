// import { createClient } from '@supabase/supabase-js';
// import { currentUser, getAuth } from '@clerk/nextjs/server';

import { useUser } from "@clerk/nextjs";
import { createClient } from "./supabase/client";


export async function storeUserInSupabase() {
    try {
        // Get the authenticated user
        const { user } = useUser();
        if (!user) return null;

        const supabase = createClient()

        // Extract user information
        const primaryEmail = user.emailAddresses.find(email => email.primaryEmail)?.emailAddress;

        if (!primaryEmail) {
            console.error('No primary email found for user');
            return null;
        }

        // Upsert the user profile
        const { data, error } = await supabase
            .from('profiles')
            .upsert({
                user_id: user.id,
                email: primaryEmail,
                username: user.username || primaryEmail.split('@')[0],
                first_name: user.firstName || null,
                last_name: user.lastName || null,
                avatar_url: user.imageUrl || null,
                updated_at: new Date()
            }, {
                onConflict: 'user_id',
                returning: 'minimal'
            });

        if (error) {
            console.error('Error storing user profile:', error);
            return null;
        }

        return true;
    } catch (error) {
        console.error('Auth error:', error);
        return null;
    }
}