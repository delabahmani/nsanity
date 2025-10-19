/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Button from "../ui/Button";
import Modal from "../Modal";
import toast from "react-hot-toast";

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface EmailPreferences {
  orderUpdates: boolean;
  promotions: boolean;
  newsletter: boolean;
}

export default function ProfileSettings() {
  const router = useRouter();
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showEmailPreferencesModal, setShowEmailPreferencesModal] =
    useState(false);
  const [showPrivacySettingsModal, setShowPrivacySettingsModal] =
    useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [emailPrefs, setEmailPrefs] = useState<EmailPreferences>({
    orderUpdates: true,
    promotions: false,
    newsletter: false,
  });

  const [loading, setLoading] = useState(false);

  // Change Password Implementation
  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/changePassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        toast.success("Password changed successfully");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowChangePasswordModal(false);
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to change password");
      }
    } catch (error) {
      toast.error("Error changing password");
    } finally {
      setLoading(false);
    }
  };

  // Load existing email preferences
  useEffect(() => {
    const loadEmailPreferences = async () => {
      try {
        const response = await fetch("/api/user/email-preference");
        if (response.ok) {
          const data = await response.json();
          setEmailPrefs(data);
        }
      } catch (error) {
        console.error("Error loading email preferences:", error);
      }
    };

    loadEmailPreferences();
  }, []);

  // Email Preferences Implementation
  const handleEmailPreferences = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/user/email-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailPrefs),
      });

      if (response.ok) {
        toast.success("Email preferences updated successfully");
        setShowEmailPreferencesModal(false);
      } else {
        toast.error("Failed to update email preferences");
      }
    } catch (_error) {
      toast.error("Error updating email preferences");
    } finally {
      setLoading(false);
    }
  };

  // Privacy Settings Implementation
  const handlePrivacySettings = () => {
    setShowPrivacySettingsModal(true);
  };

  // Support Actions Implementation
  const handleContactSupport = () => {
    router.push("/contact");
  };

  const handleReturnPolicy = () => {
    router.push("/return-policy");
  };

  // Delete Account Implementation
  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/user/delete-account", {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Account deleted successfully");
        await signOut({ redirect: false });
        router.push("/");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to delete account");
      }
    } catch (_error) {
      toast.error("Error deleting account");
    } finally {
      setLoading(false);
      setShowDeleteConfirmModal(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Account Settings */}
      <div className="bg-nsanity-white rounded-xl shadow p-6">
        <h2 className="font-semibold text-lg mb-6">Account Settings</h2>
        <div className="space-y-3">
          <Button
            className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => setShowChangePasswordModal(true)}
          >
            Change Password
          </Button>
          <Button
            className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => setShowEmailPreferencesModal(true)}
          >
            Email Preferences
          </Button>
          <Button
            className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={handlePrivacySettings}
          >
            Privacy Settings
          </Button>
        </div>
      </div>

      {/* Support */}
      <div className="bg-nsanity-white rounded-xl shadow p-6">
        <h2 className="font-semibold text-lg mb-6">Support</h2>
        <div className="space-y-3">
          <Button
            className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={handleContactSupport}
          >
            Contact Support
          </Button>

          <Button
            className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={handleReturnPolicy}
          >
            Return Policy
          </Button>

          {/* Delete Account Button */}
          <div>
            <Button
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              onClick={() => setShowDeleteConfirmModal(true)}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <Modal
          isOpen={showChangePasswordModal}
          onClose={() => setShowChangePasswordModal(false)}
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Updating..." : "Update Password"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowChangePasswordModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Email Preferences Modal */}
      {showEmailPreferencesModal && (
        <Modal
          isOpen={showEmailPreferencesModal}
          onClose={() => setShowEmailPreferencesModal(false)}
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Email Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Order Updates</label>
                <input
                  type="checkbox"
                  checked={emailPrefs.orderUpdates}
                  onChange={(e) =>
                    setEmailPrefs({
                      ...emailPrefs,
                      orderUpdates: e.target.checked,
                    })
                  }
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Promotions & Deals
                </label>
                <input
                  type="checkbox"
                  checked={emailPrefs.promotions}
                  onChange={(e) =>
                    setEmailPrefs({
                      ...emailPrefs,
                      promotions: e.target.checked,
                    })
                  }
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Newsletter</label>
                <input
                  type="checkbox"
                  checked={emailPrefs.newsletter}
                  onChange={(e) =>
                    setEmailPrefs({
                      ...emailPrefs,
                      newsletter: e.target.checked,
                    })
                  }
                  className="h-4 w-4"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleEmailPreferences}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Saving..." : "Save Preferences"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowEmailPreferencesModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Privacy Settings Modal */}
      {showPrivacySettingsModal && (
        <Modal
          isOpen={showPrivacySettingsModal}
          onClose={() => setShowPrivacySettingsModal(false)}
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Your privacy is important to us. We follow strict data
                protection guidelines and never share your personal information
                with third parties without your consent.
              </p>
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Data Collection</h4>
                <p className="text-sm text-gray-600 mb-3">
                  We collect only the data necessary to provide our services and
                  improve your experience.
                </p>
                <h4 className="font-medium mb-2">Data Usage</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Your data is used to process orders, send updates, and
                  personalize your shopping experience.
                </p>
              </div>
              <Button
                onClick={() => setShowPrivacySettingsModal(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirmModal && (
        <Modal
          isOpen={showDeleteConfirmModal}
          onClose={() => setShowDeleteConfirmModal(false)}
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-red-600">
              Delete Account
            </h3>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete your account? This action cannot
                be undone and will:
              </p>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>Permanently delete your profile and order history</li>
                <li>Remove all saved favorites and cart items</li>
                <li>Cancel any pending orders</li>
                <li>Unsubscribe you from all emails</li>
              </ul>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? "Deleting..." : "Yes, Delete Account"}
                </button>
                <Button
                  variant="ghost"
                  onClick={() => setShowDeleteConfirmModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
