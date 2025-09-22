"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ProfileHeader from "@/components/Profile/ProfileHeader";
import ProfileTabs from "@/components/Profile/ProfileTabs";
import ProfileInfo from "@/components/Profile/ProfileInfo";
import ProfileFavorites from "@/components/Profile/ProfileFavorites";
import ProfileOrders from "@/components/Profile/ProfileOrders";
import ProfileSettings from "@/components/Profile/ProfileSettings";
import toast from "react-hot-toast";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  image?: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tab, setTab] = useState<
    "profile" | "favorites" | "orders" | "settings"
  >("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/sign-in");
    }
  }, [status, router]);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (status !== "authenticated" || !session?.user?.email) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/user/profile");
        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const userData = await response.json();

        // Transform the data to match our UserProfile interface
        setUserInfo({
          id: userData.id,
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          address: {
            street: userData.address?.street || "",
            city: userData.address?.city || "",
            state: userData.address?.state || "",
            zipCode: userData.address?.zipCode || "",
            country: userData.address?.country || "",
          },
          image: userData.image,
        });
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [status, session]);

  // Handle profile updates
  const handleChange = (field: string, value: string) => {
    if (!userInfo) return;

    if (["street", "city", "state", "zipCode", "country"].includes(field)) {
      setUserInfo((prev) => ({
        ...prev!,
        address: {
          ...prev!.address,
          [field]: value,
        },
      }));
    } else {
      setUserInfo((prev) => ({
        ...prev!,
        [field]: value,
      }));
    }
  };

  // Save profile changes
  const handleSave = async () => {
    if (!userInfo) return;

    try {
      setLoading(true);
      const response = await fetch("/api/user/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userInfo.name,
          phone: userInfo.phone,
          address: userInfo.address,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      setIsEditing(false);
      // You could show a success message here
      console.log("Profile updated successfully");
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#fffbf8] nav-pad flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <p className="mt-4 text-gray-600">Loading profile...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#fffbf8] nav-pad flex flex-col items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (status === "unauthenticated") {
    return null; // Will redirect via useEffect
  }

  // No user info loaded
  if (!userInfo) {
    return (
      <div className="min-h-screen bg-[#fffbf8] nav-pad flex flex-col items-center justify-center">
        <p className="text-gray-600">No profile data found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffbf8] nav-pad flex flex-col items-center">
      <div className="w-full max-w-5xl">
        <ProfileHeader
          name={userInfo.name}
          isEditing={isEditing}
          onEditToggle={() => setIsEditing((v) => !v)}
        />
        <ProfileTabs tab={tab} setTab={setTab} />
        {tab === "profile" && (
          <ProfileInfo
            userInfo={userInfo}
            isEditing={isEditing}
            onChange={handleChange}
            onSave={handleSave}
          />
        )}
        {tab === "favorites" && <ProfileFavorites />}
        {tab === "orders" && <ProfileOrders />}
        {tab === "settings" && <ProfileSettings />}
      </div>
    </div>
  );
}
