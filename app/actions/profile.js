
// app/actions/profile.js
'use server'
import { createClient } from '@/utils/supabase/server';
import { currentUser } from '@clerk/nextjs/server';

export async function upsertUserProfile() {
    const user = await currentUser();

    if (!user) {
        return { success: false, error: 'No user found' };
    }

    try {
        const supabase = await createClient();


        // Extract user information
        const mail = user?.emailAddresses[0]?.emailAddress;

        if (!mail) {
            return { success: false, error: 'No email found' };
        }

        console.log('Attempting to upsert user:', {
            id: user.id,
            email: mail
        });

        // Upsert the user profile
        const { data, error } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                user_id: user.id,
                email: mail,
                username: user?.username || mail.split('@')[0],
                first_name: user?.firstName || null,
                last_name: user?.lastName || null,
                avatar_url: user.imageUrl || null,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id',
                returning: 'representation'
            });

        if (error) {
            console.error('Error updating profile:', error);
            return { success: false, error: error.message };
        }

        console.log('Profile updated successfully:', data);
        return { success: true, data };

    } catch (error) {
        console.error('Caught error:', error);
        return { success: false, error: error.message };
    }
}





