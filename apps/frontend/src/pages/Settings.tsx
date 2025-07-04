import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Clock,
  Volume2,
  Shield,
  Palette,
  Mic,
  User,
  Bell,
  Save,
  RotateCcw,
  Camera
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import GlassCard from '../components/GlassCard';
import { useTheme } from '../contexts/ThemeContext';

const fontSizeMap: Record<string, string> = {
  small: '14px',
  medium: '16px',
  large: '18px',
};

const Settings = () => {
  const { isDarkMode, toggleDarkMode, accentColor, setAccentColor } = useTheme();

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

  // Show "Changes applied!" message after saving
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const handleSaveSettings = () => {
    localStorage.setItem('pollAppSettings', JSON.stringify(settings));
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 2000); // Hide after 2 seconds
  };

  // Profile Settings
  const [profileData, setProfileData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@student.edu",
    bio: "Computer Science student passionate about learning",
    avatar: "https://imgs.search.brave.com/x5_5ivfXsbQ-qwitDVJyk-aJx6KxpIIi0BgyHXDu8Jg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/ZnJlZS1wc2QvM2Qt/aWxsdXN0cmF0aW9u/LWh1bWFuLWF2YXRh/ci1wcm9maWxlXzIz/LTIxNTA2NzExNDIu/anBnP3NlbXQ9YWlz/X2h5YnJpZCZ3PTc0/MA?height=100&width=100",
  })

  // Settings state
  const [settings, setSettings] = useState({
    // General Settings
    defaultTimer: 30,
    autoLaunch: false,
    enableNotifications: true,

    // Audio Settings
    selectedMicrophone: 'default',
    microphoneVolume: 100,
    enableAudioFeedback: true,

    // Theme Settings
    primaryColor: '#8B5CF6',
    secondaryColor: '#3B82F6',
    accentColor: '#14B8A6',
    fontSize: 'medium',

    // AI Settings
    aiConfidenceThreshold: 80,
    autoApproveHighConfidence: false,
    enableSmartFiltering: true,
  });

  const microphoneOptions = [
    { id: 'default', name: 'Default Microphone' },
    { id: 'external', name: 'External USB Microphone' },
    { id: 'headset', name: 'Bluetooth Headset' },
    { id: 'webcam', name: 'Webcam Microphone' },
  ];

  const colorPresets = [
    { name: 'Purple', primary: '#8B5CF6', secondary: '#3B82F6', accent: '#14B8A6' },
    { name: 'Blue', primary: '#3B82F6', secondary: '#1D4ED8', accent: '#06B6D4' },
    { name: 'Green', primary: '#10B981', secondary: '#059669', accent: '#8B5CF6' },
    { name: 'Orange', primary: '#F59E0B', secondary: '#D97706', accent: '#EF4444' },
  ];



  const handleResetSettings = () => {
    setSettings({
      defaultTimer: 30,
      autoLaunch: false,
      enableNotifications: true,
      selectedMicrophone: 'default',
      microphoneVolume: 75,
      enableAudioFeedback: true,
      sessionTimeout: 60,
      primaryColor: '#8B5CF6',
      secondaryColor: '#3B82F6',
      accentColor: '#14B8A6',
      fontSize: 'medium',
      aiConfidenceThreshold: 80,
      autoApproveHighConfidence: false,
      enableSmartFiltering: true,
    });
  };

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: (value: boolean) => void }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ${enabled ? 'bg-primary-500' : 'bg-gray-600'
        }`}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ${enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
      />
    </button>
  );

  useEffect(() => {
    const fontSize = fontSizeMap[settings.fontSize] || fontSizeMap.medium;
    document.documentElement.style.setProperty('--app-font-size', fontSize);
    // Optionally, set on body for legacy support:
    document.body.style.fontSize = fontSize;
  }, [settings.fontSize]);
  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', settings.secondaryColor);
    document.documentElement.style.setProperty('--accent-color', settings.accentColor);
  }, [settings.primaryColor, settings.secondaryColor, settings.accentColor]);

  useEffect(() => {
    const saved = localStorage.getItem('pollAppSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  function handleSettingChange(
    key: keyof typeof settings,
    value: typeof settings[keyof typeof settings]
  ): void {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  }
  return (

    <DashboardLayout>
      {/* Success Message Popup */}
      {showSavedMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in-down">
            <Save className="w-5 h-5" />
            Changes applied!
          </div>
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
            <p className="text-gray-400">Customize your polling system preferences</p>
          </div>
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleResetSettings}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-colors duration-200"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSaveSettings}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Information */}
          <GlassCard className="p-6 lg:col-span-2">
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

          {/* General Settings */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <SettingsIcon className="w-5 h-5 mr-2" />
              General Settings
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Default Timer Duration
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="10"
                    max="120"
                    value={settings.defaultTimer}
                    onChange={(e) => handleSettingChange('defaultTimer', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-white font-medium w-12">{settings.defaultTimer}s</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-300">Enable Auto-Launch</label>
                  <p className="text-xs text-gray-400">Automatically launch approved questions</p>
                </div>
                <ToggleSwitch
                  enabled={settings.autoLaunch}
                  onChange={(value) => handleSettingChange('autoLaunch', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-300">Enable Notifications</label>
                  <p className="text-xs text-gray-400">Receive system notifications</p>
                </div>
                <ToggleSwitch
                  enabled={settings.enableNotifications}
                  onChange={(value) => handleSettingChange('enableNotifications', value)}
                />
              </div>
            </div>
          </GlassCard>

          {/* Audio Settings */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Mic className="w-5 h-5 mr-2" />
              Audio Settings
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Microphone Device
                </label>
                <select
                  value={settings.selectedMicrophone}
                  onChange={(e) => handleSettingChange('selectedMicrophone', e.target.value)}
                  className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {microphoneOptions.map(option => (
                    <option key={option.id} value={option.id} className="bg-gray-800">
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Microphone Volume
                </label>
                <div className="flex items-center space-x-4">
                  <Volume2 className="w-4 h-4 text-gray-400" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.microphoneVolume}
                    onChange={(e) => handleSettingChange('microphoneVolume', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-white font-medium w-12">{settings.microphoneVolume}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-300">Audio Feedback</label>
                  <p className="text-xs text-gray-400">Play sounds for interactions</p>
                </div>
                <ToggleSwitch
                  enabled={settings.enableAudioFeedback}
                  onChange={(value) => handleSettingChange('enableAudioFeedback', value)}
                />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 relative overflow-hidden">
            {/* Animated lock background */}
            <div className="absolute right-2 bottom-2 opacity-10 pointer-events-none select-none">
              <Shield className="w-32 h-32 text-purple-400 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 flex items-center relative z-10">
              <Shield className="w-5 h-5 mr-2" />
              Security Settings
            </h3>
            <p className="text-gray-400 mb-6 relative z-10">
              Set how long your session stays active for extra security.
              <span className="inline-block ml-2 px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full align-middle">Recommended: 60m</span>
            </p>
            <div className="space-y-6 relative z-10">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Session Timeout (minutes)
                </label>
                <div className="flex items-center space-x-4">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div className="flex-1 flex flex-col">
                    <input
                      type="range"
                      min="15"
                      max="180"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                      className="w-full accent-purple-500"
                      title="Adjust how long your session stays active"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>15m</span>
                      <span>180m</span>
                    </div>
                  </div>
                  <span className="text-white font-medium w-12 text-center">
                    {settings.sessionTimeout}m
                  </span>
                </div>
                {/* Divider */}
                <div className="mt-6 border-t border-white/10" />
                {/* Creative tip */}
                <div className="mt-4 flex items-center gap-2 text-purple-300 text-xs">
                  <Shield className="w-4 h-4" />
                  <span>
                    Tip: Shorter timeouts keep your account safer on shared devices!
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Theme Settings */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Palette className="w-5 h-5 mr-2" />
              Theme Settings
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-300">Dark Mode</label>
                  <p className="text-xs text-gray-400">Toggle between light and dark themes</p>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className="p-2 bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Color Presets
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {colorPresets.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        handleSettingChange('primaryColor', preset.primary);
                        handleSettingChange('secondaryColor', preset.secondary);
                        handleSettingChange('accentColor', preset.accent);
                      }}
                      className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-200"
                    >
                      <div className="flex space-x-1">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: preset.secondary }}
                        />
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: preset.accent }}
                        />
                      </div>
                      <span className="text-white text-sm">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Font Size
                </label>
                <select
                  value={settings.fontSize}
                  onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                  className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="small" className="bg-gray-800">Small</option>
                  <option value="medium" className="bg-gray-800">Medium</option>
                  <option value="large" className="bg-gray-800">Large</option>
                </select>
              </div>
            </div>
          </GlassCard>

        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Settings;
