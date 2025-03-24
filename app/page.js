import { AutoCarosel } from "@/components/AutoCarosel";
import Products from "@/components/Products";
import { currentUser } from '@clerk/nextjs/server'
import { upsertUserProfile } from "./actions/profile";





export default async function Home() {

  const user = await currentUser()
  let profileResult = null;

  if (user) {
    // Update profile in Supabase and log the result
    profileResult = await upsertUserProfile();
    console.log('Profile update result:', profileResult);
  }



  return (
    <div className="bg-gray-50">

      <AutoCarosel />

      <Products />
    </div>
  );
}
