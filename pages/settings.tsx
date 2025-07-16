import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Settings, Bell, Moon, Sun, Eye, EyeOff, Smartphone, Monitor, X, Check } from 'lucide-react';
import Layout from '../components/Layout';
import BackButton from '../components/BackButton';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    autoSave: true,
    progressReminders: true,
    weeklyReports: false,
    soundEffects: true,
    compactMode: false,
    motivationalQuotes: true,
    gpt4: false,
  });

  // Load preferences from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const prefs = localStorage.getItem('userPreferences');
      if (prefs) setSettings(prev => ({ ...prev, ...JSON.parse(prefs) }));
      const gpt4 = localStorage.getItem('enableGPT4');
      if (gpt4 === 'true') setSettings(prev => ({ ...prev, gpt4: true }));
    }
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userPreferences', JSON.stringify(settings));
      localStorage.setItem('enableGPT4', settings.gpt4 ? 'true' : 'false');
    }
  }, [settings]);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  const onboardingSteps = [
    {
      title: "Welcome to SmartShelf! 🎉",
      description: "Your personal learning and habit tracking companion. Let's get you set up for success.",
      icon: "✨"
    },
    {
      title: "Track Your Learning 📚",
      description: "Add books, podcasts, videos, and courses. Track your progress and never lose your place.",
      icon: "📚"
    },
    {
      title: "Build Better Habits 🎯",
      description: "Create habits that stick. Set goals, track progress, and celebrate your wins.",
      icon: "🎯"
    },
    {
      title: "Get Insights 📊",
      description: "See your progress over time. Understand your patterns and optimize your learning.",
      icon: "📊"
    },
    {
      title: "You're All Set! 🚀",
      description: "Start your journey to better habits and continuous learning. The sky's the limit!",
      icon: "🚀"
    }
  ];

  const handleSettingToggle = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleOnboardingNext = () => {
    if (onboardingStep < onboardingSteps.length - 1) {
      setOnboardingStep(prev => prev + 1);
    } else {
      setShowOnboarding(false);
      setOnboardingStep(0);
    }
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    setOnboardingStep(0);
  };

  return (
    <>
      <Head>
        <title>Settings - SmartShelf</title>
        <meta name="description" content="Customize your SmartShelf experience" />
      </Head>
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Header */}
            <header className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <Settings className="w-8 h-8 text-blue-600" />
                <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
              </div>
              <p className="text-lg text-gray-600">Customize your SmartShelf experience</p>
            </header>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Notifications */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <Bell className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">Push Notifications</h3>
                      <p className="text-sm text-gray-600">Get reminded about your habits and learning goals</p>
                    </div>
                    <button
                      onClick={() => handleSettingToggle('notifications')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.notifications ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.notifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">Progress Reminders</h3>
                      <p className="text-sm text-gray-600">Weekly reminders to update your progress</p>
                    </div>
                    <button
                      onClick={() => handleSettingToggle('progressReminders')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.progressReminders ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.progressReminders ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">Weekly Reports</h3>
                      <p className="text-sm text-gray-600">Receive a summary of your weekly progress</p>
                    </div>
                    <button
                      onClick={() => handleSettingToggle('weeklyReports')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.weeklyReports ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.weeklyReports ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Appearance */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <Sun className="w-6 h-6 text-yellow-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Appearance</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">Dark Mode</h3>
                      <p className="text-sm text-gray-600">Switch to dark theme for better eye comfort</p>
                    </div>
                    <button
                      onClick={() => handleSettingToggle('darkMode')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.darkMode ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">Compact Mode</h3>
                      <p className="text-sm text-gray-600">Reduce spacing for more content on screen</p>
                    </div>
                    <button
                      onClick={() => handleSettingToggle('compactMode')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.compactMode ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.compactMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-6">
                    <div>
                      <h3 className="font-semibold text-gray-900">Motivational Quotes</h3>
                      <p className="text-sm text-gray-600">Show motivational quotes on the dashboard</p>
                    </div>
                    <button
                      onClick={() => handleSettingToggle('motivationalQuotes')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.motivationalQuotes ? 'bg-blue-600' : 'bg-gray-200'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.motivationalQuotes ? 'translate-x-6' : 'translate-x-1'}`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-6">
                    <div>
                      <h3 className="font-semibold text-gray-900">Light/Dark Mode</h3>
                      <p className="text-sm text-gray-600">Switch between light and dark theme (coming soon)</p>
                    </div>
                    <button
                      onClick={() => handleSettingToggle('darkMode')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.darkMode ? 'bg-blue-600' : 'bg-gray-200'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.darkMode ? 'translate-x-6' : 'translate-x-1'}`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-6">
                    <div>
                      <h3 className="font-semibold text-gray-900">Use GPT-4</h3>
                      <p className="text-sm text-gray-600">Upgrade AI to GPT-4 (if OpenAI key present)</p>
                    </div>
                    <button
                      onClick={() => handleSettingToggle('gpt4')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.gpt4 ? 'bg-blue-600' : 'bg-gray-200'}`}
                      disabled={false}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.gpt4 ? 'translate-x-6' : 'translate-x-1'}`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Behavior */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <Monitor className="w-6 h-6 text-green-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Behavior</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">Auto Save</h3>
                      <p className="text-sm text-gray-600">Automatically save your progress</p>
                    </div>
                    <button
                      onClick={() => handleSettingToggle('autoSave')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.autoSave ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.autoSave ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">Sound Effects</h3>
                      <p className="text-sm text-gray-600">Play sounds for interactions</p>
                    </div>
                    <button
                      onClick={() => handleSettingToggle('soundEffects')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.soundEffects ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.soundEffects ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <Smartphone className="w-6 h-6 text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
                </div>
                
                <div className="space-y-4">
                  <button
                    onClick={() => setShowOnboarding(true)}
                    className="w-full flex items-center justify-between p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎯</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">Show Onboarding</h3>
                        <p className="text-sm text-gray-600">Replay the welcome tour</p>
                      </div>
                    </div>
                    <Check className="w-5 h-5 text-blue-600" />
                  </button>
                  
                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📊</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">Export Data</h3>
                        <p className="text-sm text-gray-600">Download your progress data</p>
                      </div>
                    </div>
                    <Check className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🔄</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">Sync Settings</h3>
                        <p className="text-sm text-gray-600">Sync across devices</p>
                      </div>
                    </div>
                    <Check className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Onboarding Modal */}
        {showOnboarding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-0 overflow-hidden">
              <div className="p-8 text-center">
                <div className="text-6xl mb-6">
                  {onboardingSteps[onboardingStep].icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {onboardingSteps[onboardingStep].title}
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  {onboardingSteps[onboardingStep].description}
                </p>
                
                <div className="flex items-center justify-center gap-2 mb-6">
                  {onboardingSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === onboardingStep ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleOnboardingSkip}
                    className="flex-1 px-4 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Skip
                  </button>
                  <button
                    onClick={handleOnboardingNext}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    {onboardingStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
                  </button>
                </div>
              </div>
              
              <button
                onClick={handleOnboardingSkip}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </Layout>
    </>
  );
} 