import LoadingSpinner from "@/components/LoadingSpinner";
import ProfileClient from "@/components/Profile/ProfileClient";
import { Suspense } from "react";

export const metadata = {
  title: "profile | nsanity",
  description: "Manage your account and preferences",
};

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div>
          <LoadingSpinner size="large" />
        </div>
      }
    >
      <ProfileClient />
    </Suspense>
  );
}
