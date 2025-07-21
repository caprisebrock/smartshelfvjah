import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Settings, Save, Sparkles, Brain, Zap, MessageSquare, Quote, Eye, EyeOff, Trash2, Download, Upload } from 'lucide-react';
import BackButton from '../components/BackButton';
import Sidebar from '../components/Sidebar';

interface SmartSettings {
  enableMotivationalQuotes: boolean;
  enableGPT4: boolean;
  enableSmartFocus: boolean;
  storeAIHistory: boolean;
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  autoSave: boolean;
  compactMode: boolean;
}

const DEFAULT_SETTINGS: SmartSettings = {
  enableMotivationalQuotes: true,
  enableGPT4: false,
  enableSmartFocus: true,
  storeAIHistory: true,
  theme: 'light',
  notifications: true,
  autoSave: true,
  compactMode: false,
};

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<SmartSettings>(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dataStats, setDataStats] = useState({
    aiHistory: 0,
    aiNotes: 0,
    resources: 0,
    sessions: 0,
  });

  // Load settings from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedSettings = localStorage.getItem('smartSettings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        }

        // Load data statistics
        const aiHistory = JSON.parse(localStorage.getItem('aiHistory') || '[]');
        const aiNotes = JSON.parse(localStorage.getItem('aiNotes') || '[]');
        const resources = JSON.parse(localStorage.getItem('resources') || '[]');
        const sessions = JSON.parse(localStorage.getItem('sessionHistory') || '[]');
        
        setDataStats({
          aiHistory: aiHistory.length,
          aiNotes: aiNotes.length,
          resources: resources.length,
          sessions: sessions.length,
        });
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, []);

  // Handle setting changes
  const handleSettingChange = (key: keyof SmartSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  // Save settings
  const handleSave = async () => {
    if (typeof window === 'undefined') return;
    
    setSaving(true);
    try {
      localStorage.setItem('smartSettings', JSON.stringify(settings));
      setHasChanges(false);
      
      // Show success feedback
      setTimeout(() => setSaving(false), 800);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaving(false);
    }
  };

  // Reset settings
  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      setSettings(DEFAULT_SETTINGS);
      setHasChanges(true);
    }
  };

  // Clear AI data
  const handleClearAIData = () => {
    if (confirm('Are you sure you want to clear all AI chat history and notes? This action cannot be undone.')) {
      localStorage.removeItem('aiHistory');
      localStorage.removeItem('aiNotes');
      setDataStats(prev => ({ ...prev, aiHistory: 0, aiNotes: 0 }));
    }
  };

  // Export data
  const handleExportData = () => {
    try {
      const data = {
        settings,
        aiHistory: JSON.parse(localStorage.getItem('aiHistory') || '[]'),
        aiNotes: JSON.parse(localStorage.getItem('aiNotes') || '[]'),
        resources: JSON.parse(localStorage.getItem('resources') || '[]'),
        sessionHistory: JSON.parse(localStorage.getItem('sessionHistory') || '[]'),
        exportDate: new Date().toISOString(),
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smartshelf-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  // Import data
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (confirm('This will replace all your current data. Are you sure you want to continue?')) {
          if (data.settings) {
            setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
            localStorage.setItem('smartSettings', JSON.stringify(data.settings));
          }
          if (data.aiHistory) localStorage.setItem('aiHistory', JSON.stringify(data.aiHistory));
          if (data.aiNotes) localStorage.setItem('aiNotes', JSON.stringify(data.aiNotes));
          if (data.resources) localStorage.setItem('resources', JSON.stringify(data.resources));
          if (data.sessionHistory) localStorage.setItem('sessionHistory', JSON.stringify(data.sessionHistory));
          
          // Refresh the page to reflect changes
          window.location.reload();
        }
      } catch (error) {
        console.error('Failed to import data:', error);
        alert('Invalid backup file. Please select a valid SmartShelf backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <Head>
        <title>Settings - SmartShelf</title>
        <meta name="description" content="Customize your SmartShelf experience" />
      </Head>
      <div className="min-h-screen bg-gray-50 flex animate-fadeIn">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8 animate-slideIn">
              <div className="lg:hidden">
                <BackButton />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Settings className="w-6 h-6 text-gray-600" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                </div>
                <p className="text-gray-600">Customize your SmartShelf learning experience</p>
              </div>
              {hasChanges && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary group"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Save Changes
                      <Sparkles className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-all" />
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Main Settings */}
              <div className="lg:col-span-2 space-y-8">
                {/* AI Features */}
                <div className="card-gradient animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Brain className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">AI Features</h3>
                        <p className="text-gray-600 text-sm">Configure your AI learning assistant</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* GPT-4 Access */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                        <div className="flex items-center gap-3 flex-1">
                          <Zap className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">GPT-4 Access</div>
                            <div className="text-sm text-gray-600">Enable premium AI model for better responses</div>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={settings.enableGPT4}
                            onChange={(e) => handleSettingChange('enableGPT4', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                        </label>
                      </div>

                      {/* AI Chat History */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="flex items-center gap-3 flex-1">
                          <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">Store AI Chat History</div>
                            <div className="text-sm text-gray-600">Save your AI conversations locally for reference</div>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={settings.storeAIHistory}
                            onChange={(e) => handleSettingChange('storeAIHistory', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Learning Features */}
                <div className="card-gradient animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <Brain className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Learning Features</h3>
                        <p className="text-gray-600 text-sm">Enhance your learning experience</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* SmartFocus Mode */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                                                  <div className="flex items-center gap-3 flex-1">
                            <Brain className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">SmartFocus Mode</div>
                              <div className="text-sm text-gray-600">Enable immersive learning sessions</div>
                            </div>
                          </div>
                                                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                            <input
                              type="checkbox"
                              checked={settings.enableSmartFocus}
                              onChange={(e) => handleSettingChange('enableSmartFocus', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                          </label>
                      </div>

                      {/* Motivational Quotes */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-pink-50 rounded-xl border border-pink-200">
                                                  <div className="flex items-center gap-3 flex-1">
                            <Quote className="w-5 h-5 text-pink-600 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">Motivational Quotes</div>
                              <div className="text-sm text-gray-600">Show inspiring quotes throughout the app</div>
                            </div>
                          </div>
                                                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                            <input
                              type="checkbox"
                              checked={settings.enableMotivationalQuotes}
                              onChange={(e) => handleSettingChange('enableMotivationalQuotes', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                          </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* General Settings */}
                <div className="card-gradient animate-fadeIn" style={{ animationDelay: '0.6s' }}>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                        <Settings className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">General Settings</h3>
                        <p className="text-gray-600 text-sm">Customize your app experience</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Theme */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">Theme</label>
                        <div className="grid grid-cols-3 gap-3">
                          {(['light', 'dark', 'auto'] as const).map((theme) => (
                            <label
                              key={theme}
                              className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                settings.theme === theme
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 bg-white hover:border-blue-200'
                              }`}
                            >
                              <input
                                type="radio"
                                name="theme"
                                value={theme}
                                checked={settings.theme === theme}
                                onChange={(e) => handleSettingChange('theme', e.target.value)}
                                className="sr-only"
                              />
                              <span className="text-sm font-medium capitalize">{theme}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Other Settings */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">Notifications</div>
                            <div className="text-sm text-gray-600">Receive learning reminders</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.notifications}
                              onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">Auto-save</div>
                            <div className="text-sm text-gray-600">Automatically save your progress</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.autoSave}
                              onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">Compact Mode</div>
                            <div className="text-sm text-gray-600">Use smaller UI elements</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.compactMode}
                              onChange={(e) => handleSettingChange('compactMode', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advanced Settings */}
                <div className="card-gradient animate-fadeIn" style={{ animationDelay: '0.8s' }}>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                          <Settings className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Advanced Settings</h3>
                          <p className="text-gray-600 text-sm">Data management and reset options</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="btn-ghost"
                      >
                        {showAdvanced ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                        {showAdvanced ? 'Hide' : 'Show'}
                      </button>
                    </div>

                    {showAdvanced && (
                      <div className="space-y-4">
                        {/* Data Export/Import */}
                        <div className="flex gap-3">
                          <button
                            onClick={handleExportData}
                            className="btn-secondary flex-1"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Export Data
                          </button>
                          <label className="btn-secondary flex-1 cursor-pointer">
                            <Upload className="w-4 h-4 mr-2" />
                            Import Data
                            <input
                              type="file"
                              accept=".json"
                              onChange={handleImportData}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {/* Clear AI Data */}
                        <button
                          onClick={handleClearAIData}
                          className="btn-danger w-full"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Clear AI Data
                        </button>

                        {/* Reset Settings */}
                        <button
                          onClick={handleReset}
                          className="btn-danger w-full"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Reset All Settings
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="lg:col-span-1">
                <div className="card-gradient animate-fadeIn sticky top-6" style={{ animationDelay: '1s' }}>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Data Overview</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">AI Chats</span>
                        </div>
                        <span className="text-sm font-bold text-blue-700">{dataStats.aiHistory}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <Save className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-900">AI Notes</span>
                        </div>
                        <span className="text-sm font-bold text-green-700">{dataStats.aiNotes}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-900">Resources</span>
                        </div>
                        <span className="text-sm font-bold text-purple-700">{dataStats.resources}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-orange-600" />
                          <span className="text-sm font-medium text-orange-900">Sessions</span>
                        </div>
                        <span className="text-sm font-bold text-orange-700">{dataStats.sessions}</span>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                      <h4 className="font-medium text-gray-900 mb-2">Quick Tips</h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Enable GPT-4 for better AI responses</li>
                        <li>• Use SmartFocus for distraction-free learning</li>
                        <li>• Export your data regularly as backup</li>
                        <li>• Motivational quotes boost learning motivation</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 