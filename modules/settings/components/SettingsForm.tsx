// COPY THIS ENTIRE FILE FROM: pages/settings.tsx 
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Settings, Save, Sparkles, Brain, Zap, MessageSquare, Quote, Eye, EyeOff, Trash2, Download, Upload, Moon, Sun, Monitor } from 'lucide-react';
import BackButton from '../../shared/components/BackButton';
import StatBadge from '../../progress/components/StatBadge';
import { useTheme } from '../../styles/themes/themeConfig';

interface SmartSettings {
  enableMotivationalQuotes: boolean;
  enableGPT4: boolean;
  enableSmartFocus: boolean;
  storeAIHistory: boolean;
  notifications: boolean;
  autoSave: boolean;
  compactMode: boolean;
}

const DEFAULT_SETTINGS: SmartSettings = {
  enableMotivationalQuotes: true,
  enableGPT4: false,
  enableSmartFocus: true,
  storeAIHistory: true,
  notifications: true,
  autoSave: true,
  compactMode: false,
};

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<SmartSettings>(DEFAULT_SETTINGS);
  const { theme, setTheme, isDark } = useTheme();
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
      <div className="flex flex-col gap-6 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 animate-slideIn">
          <div className="flex items-center gap-4">
            <div className="lg:hidden">
              <BackButton />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Customize your SmartShelf learning experience</p>
              </div>
            </div>
          </div>
          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 group"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                  <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                </>
              )}
            </button>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8">
          {/* Settings Sections */}
          <div className="flex flex-col gap-6">
            {/* AI Features */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI Features</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Configure your AI learning assistant</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* GPT-4 Access */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
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

                <div className="space-y-4">
                  {/* SmartFocus Mode */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-pink-50 rounded-lg border border-pink-200">
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 animate-fadeIn" style={{ animationDelay: '0.6s' }}>
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
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Theme</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['light', 'dark', 'auto'] as const).map((themeOption) => {
                        const isSelected = theme === themeOption;
                        const IconComponent = themeOption === 'light' ? Sun : themeOption === 'dark' ? Moon : Monitor;
                        
                        return (
                          <label
                            key={themeOption}
                            className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:border-blue-400'
                                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-blue-200 dark:hover:border-blue-500'
                            }`}
                            onClick={() => setTheme(themeOption)}
                          >
                            <IconComponent className={`w-5 h-5 mb-2 ${
                              isSelected 
                                ? 'text-blue-600 dark:text-blue-400' 
                                : 'text-gray-500 dark:text-gray-400'
                            }`} />
                            <span className={`text-sm font-medium capitalize ${
                              isSelected
                                ? 'text-blue-700 dark:text-blue-300'
                                : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {themeOption}
                            </span>
                          </label>
                        );
                      })}
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 animate-fadeIn" style={{ animationDelay: '0.8s' }}>
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
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
                  >
                    {showAdvanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showAdvanced ? 'Hide' : 'Show'}
                  </button>
                </div>

                {showAdvanced && (
                  <div className="space-y-4">
                    {/* Data Export/Import */}
                    <div className="flex gap-3">
                      <button
                        onClick={handleExportData}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 flex-1"
                      >
                        <Download className="w-4 h-4" />
                        Export Data
                      </button>
                      <label className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 flex-1 cursor-pointer">
                        <Upload className="w-4 h-4" />
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
                      className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 w-full"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear AI Data
                    </button>

                    {/* Reset Settings */}
                    <button
                      onClick={handleReset}
                      className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 w-full"
                    >
                      <Settings className="w-4 h-4" />
                      Reset All Settings
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Data Overview Sidebar */}
          <aside className="flex flex-col gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 animate-fadeIn sticky top-6" style={{ animationDelay: '1s' }}>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Data Overview</h3>
                
                <div className="space-y-3">
                  <StatBadge
                    icon={MessageSquare}
                    label="AI Chats"
                    value={dataStats.aiHistory}
                    color="blue"
                  />
                  
                  <StatBadge
                    icon={Save}
                    label="AI Notes"
                    value={dataStats.aiNotes}
                    color="green"
                  />
                  
                  <StatBadge
                    icon={Brain}
                    label="Resources"
                    value={dataStats.resources}
                    color="purple"
                  />
                  
                  <StatBadge
                    icon={Zap}
                    label="Sessions"
                    value={dataStats.sessions}
                    color="orange"
                  />
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
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
          </aside>
        </div>
      </div>
    </>
  );
} 