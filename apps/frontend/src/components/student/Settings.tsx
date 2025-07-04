"use client"

import type React from "react"
import { useState,useEffect,useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Bell,
  Palette,
  Smartphone,
  Lock,
  Camera,
  Save,
  RefreshCw,
  Moon,
  Sun,
  Monitor,
  AlertTriangle
} from "lucide-react";
import GlassCard from "../GlassCard";


const Settings: React.FC = () => {

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle avatar upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileData((prev) => ({
          ...prev,
          avatar: event.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Profile Settings
  const [profileData, setProfileData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@student.edu",
    bio: "Computer Science student passionate about learning",
    avatar: "https://imgs.search.brave.com/x5_5ivfXsbQ-qwitDVJyk-aJx6KxpIIi0BgyHXDu8Jg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/ZnJlZS1wc2QvM2Qt/aWxsdXN0cmF0aW9u/LWh1bWFuLWF2YXRh/ci1wcm9maWxlXzIz/LTIxNTA2NzExNDIu/anBnP3NlbXQ9YWlz/X2h5YnJpZCZ3PTc0/MA?height=100&width=100",
  })

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    pollReminders: true,
    achievementAlerts: true,
    leaderboardUpdates: false,
    weeklyReports: true,
    soundEnabled: true,
  })


  // Appearance Settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "dark",
    language: "en",
    fontSize: "medium",
    reducedMotion: false,
    highContrast: false,
  })


  const [activeTab, setActiveTab] = useState("profile")
  const [isSaving, setIsSaving] = useState(false)
  const [showSavedMessage, setShowSavedMessage] = useState(false)

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "security", label: "Security", icon: Lock },

  ]

  useEffect(() => {
  document.documentElement.style.fontSize =
    appearanceSettings.fontSize === "small"
      ? "14px"
      : appearanceSettings.fontSize === "large"
      ? "18px"
      : "16px";
}, [appearanceSettings.fontSize]);

// Accessibility: Apply reduced motion and high contrast
  useEffect(() => {
    // Reduced Motion
    if (appearanceSettings.reducedMotion) {
      document.documentElement.style.setProperty("scroll-behavior", "auto");
      document.body.classList.add("reduced-motion");
    } else {
      document.documentElement.style.setProperty("scroll-behavior", "");
      document.body.classList.remove("reduced-motion");
    }

    // High Contrast
    if (appearanceSettings.highContrast) {
      document.body.classList.add("high-contrast");
    } else {
      document.body.classList.remove("high-contrast");
    }
  }, [appearanceSettings.reducedMotion, appearanceSettings.highContrast]);

  const navigate = useNavigate();


  const handleChangePassword = () => {
    // Navigate to a change password page or open a modal
    navigate("/student/change-password");
    // Or, if you want a modal, you can set a state like setShowChangePasswordModal(true)
  };

  const handleSave = async () => {
  setIsSaving(true);
  // Save all settings to localStorage (or API)
  localStorage.setItem("studentSettings", JSON.stringify({
    profileData,
    notificationSettings,
    privacySettings,
    appearanceSettings,
    learningSettings,
  }));
  await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 2000); // Hide after 2 seconds
  };

  const handleActiveSessions = () => {
    // Navigate to the active sessions page or open a modal
    navigate("/student/active-sessions");
    // Or, if you want a modal, you can set a state like setShowActiveSessionsModal(true)
  };

  // Modal state for delete account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Handler for Delete Account
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError("");
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsDeleting(false);
    // For demo: redirect to goodbye page or login
    navigate("/");
  };

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Personal Information</h3>
        </div>

        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src={profileData.avatar || "/placeholder.svg"}
                alt="Profile"
                className="w-20 h-20 rounded-full border-2 border-purple-500/30 object-cover"
              />
              <button
                type="button"
                className="absolute -bottom-1 -right-1 p-2 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Upload profile picture"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <h4 className="text-white font-medium">Profile Picture</h4>
              <p className="text-gray-400 text-sm">Upload a new profile picture</p>
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
              <input
                type="text"
                value={profileData.firstName}
                onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
              <input
                type="text"
                value={profileData.lastName}
                onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
            <textarea
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>
      </GlassCard>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Notification Preferences</h3>
        </div>

        <div className="space-y-4">
          {[
            { key: "emailNotifications", label: "Email Notifications", desc: "Receive notifications via email" },
            { key: "pushNotifications", label: "Push Notifications", desc: "Browser push notifications" },
            { key: "pollReminders", label: "Poll Reminders", desc: "Get reminded about active polls" },
            { key: "achievementAlerts", label: "Achievement Alerts", desc: "Notifications for new achievements" },
            { key: "leaderboardUpdates", label: "Leaderboard Updates", desc: "Updates when your ranking changes" },
            { key: "weeklyReports", label: "Weekly Reports", desc: "Weekly progress summaries" },
            { key: "soundEnabled", label: "Sound Effects", desc: "Play sounds for notifications" },
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <h4 className="text-white font-medium">{setting.label}</h4>
                <p className="text-gray-400 text-sm">{setting.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      [setting.key]: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Palette className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Appearance & Accessibility</h3>
        </div>

        <div className="space-y-6">
          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Theme</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "dark", label: "Dark", icon: Moon },
                { value: "light", label: "Light", icon: Sun },
                { value: "auto", label: "Auto", icon: Monitor },
              ].map((theme) => {
                const Icon = theme.icon
                return (
                  <button
                    key={theme.value}
                    onClick={() => setAppearanceSettings({ ...appearanceSettings, theme: theme.value })}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      appearanceSettings.theme === theme.value
                        ? "border-purple-500 bg-purple-500/20"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-6 h-6 text-white mx-auto mb-2" />
                    <span className="text-white text-sm">{theme.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Font Size</label>
            <select
              value={appearanceSettings.fontSize}
              onChange={(e) => setAppearanceSettings({ ...appearanceSettings, fontSize: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
            >
              <option value="small" className="bg-gray-800">
                Small
              </option>
              <option value="medium" className="bg-gray-800">
                Medium
              </option>
              <option value="large" className="bg-gray-800">
                Large
              </option>
            </select>
          </div>

          {/* Accessibility Options */}
          {[
            { key: "reducedMotion", label: "Reduced Motion", desc: "Minimize animations and transitions" },
            { key: "highContrast", label: "High Contrast", desc: "Increase contrast for better visibility" },
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <h4 className="text-white font-medium">{setting.label}</h4>
                <p className="text-gray-400 text-sm">{setting.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={appearanceSettings[setting.key as keyof typeof appearanceSettings]}
                  onChange={(e) =>
                    setAppearanceSettings({
                      ...appearanceSettings,
                      [setting.key]: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )

   const renderSecuritySettings = () => (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Lock className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Account Security</h3>
        </div>

        <div className="space-y-4">
          <button
            className="w-full p-4 bg-white/5 rounded-lg text-left hover:bg-white/10 transition-colors"
            onClick={handleChangePassword}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">Change Password</h4>
                <p className="text-gray-400 text-sm">Update your account password</p>
              </div>
              <Lock className="w-5 h-5 text-gray-400" />
            </div>
          </button>

          {/* Active Sessions */}
          <button
            className="w-full p-4 bg-white/5 rounded-lg text-left hover:bg-white/10 transition-colors"
            onClick={handleActiveSessions}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">Active Sessions</h4>
                <p className="text-gray-400 text-sm">Manage your active login sessions</p>
              </div>
              <Smartphone className="w-5 h-5 text-gray-400" />
            </div>
          </button>

          {/* Delete Account */}
          <button
            className="w-full p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-left hover:bg-red-500/20 transition-colors"
            onClick={() => setShowDeleteModal(true)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-red-400 font-medium">Delete Account</h4>
                <p className="text-gray-400 text-sm">Permanently delete your account and data</p>
              </div>
              <RefreshCw className="w-5 h-5 text-red-400" />
            </div>
          </button>
        </div>
      </GlassCard>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-red-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-7 h-7 text-red-400" />
              <h3 className="text-xl font-bold text-white">Delete Account</h3>
            </div>
            <p className="text-gray-300">
              Are you sure you want to <span className="text-red-400 font-semibold">permanently delete</span> your account? This action cannot be undone.
            </p>
            {deleteError && (
              <div className="text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 text-sm text-center">
                {deleteError}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-pink-600 text-white font-medium hover:from-red-700 hover:to-pink-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Delete Account
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return renderProfileSettings()
      case "notifications":
        return renderNotificationSettings()
      case "appearance":
        return renderAppearanceSettings()
      case "security":
        return renderSecuritySettings()
      default:
        return renderProfileSettings()
    }
  }

  return (
    <div className="p-8 space-y-8">

      {/* Success Message Popup */}
      {showSavedMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in-down">
            <Save className="w-5 h-5" />
            Changes successfully saved!
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <User className="w-8 h-8 text-purple-400" />
          <h1 className="text-3xl font-bold text-white">Settings</h1>
        </div>
        <p className="text-gray-400">Customize your learning experience and account preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="max-w-4xl mx-auto">{renderTabContent()}</div>

      {/* Save Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default Settings
