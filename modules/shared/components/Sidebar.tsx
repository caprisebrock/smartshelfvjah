// COPY THIS ENTIRE FILE FROM: components/Sidebar.tsx
// Move the complete contents of components/Sidebar.tsx into this file 
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useUser } from '../../auth/hooks/useUser';
import { supabase } from '../../database/config/databaseConfig';
import { BookOpen, FileText, Sparkles, BarChart2, Calendar, PlusCircle, Lightbulb, Settings, LogOut, User, Target } from 'lucide-react';
import { useEffect } from 'react';
import SignOutButton from '../../auth/components/SignOutButton';

const navItems = [
  { label: 'Dashboard', href: '/', icon: BarChart2 },
  { label: 'My Learning', href: '/my-learning', icon: BookOpen },
  { label: 'Notes', href: '/notes', icon: FileText },
  { label: 'Progress', href: '/progress', icon: Calendar },
  { label: 'Settings', href: '/settings', icon: Settings },
];

const habitItems = [
  { label: 'Habits', href: '/habits', icon: Target },
  { label: 'Add Habit', href: '/add-habit', icon: PlusCircle, isSecondary: true },
];

export default function Sidebar() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  
  const isActive = (href: string) => {
    if (href === '/') {
      return router.pathname === '/';
    }
    return router.pathname.startsWith(href);
  };

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) {
        setProfileLoading(false)
        return
      }
      
      setProfileLoading(true)
      try {
        console.log('🔍 [Sidebar] Fetching profile for user:', user.id);
        
        const { data, error } = await supabase
          .from('app_users')
          .select('name, emoji, color')
          .eq('id', user.id)
          .single()
        
        console.log('🧪 [Sidebar] Profile data:', data);
        console.log('🧪 [Sidebar] Profile error:', error);
        
        if (error) {
          console.error('❌ [Sidebar] Error fetching user profile:', error)
        } else if (data) {
          setUserProfile(data)
          console.log('✅ [Sidebar] Profile loaded successfully:', data)
        }
      } catch (error) {
        console.error('❌ [Sidebar] Unexpected error fetching user profile:', error)
      } finally {
        setProfileLoading(false)
      }
    }
    
    fetchUserProfile()
  }, [user])



  return (
    <aside className="w-64 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 h-screen overflow-y-auto">
      <div className="p-6">
        {/* Logo/Brand */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">SmartShelf</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Learning Tracker</p>
            </div>
          </div>
        </div>

        {/* Navigation - Only show if user is authenticated */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : user ? (
          <nav className="space-y-6">
            {/* Main Navigation */}
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`
                      group flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                      ${active 
                        ? 'bg-blue-100 text-blue-700 shadow-md' 
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:shadow-sm'
                      }
                      hover:scale-105 active:scale-95
                    `}
                  >
                    <Icon className={`
                      w-5 h-5 transition-all duration-200
                      ${active ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600'}
                      group-hover:scale-110
                    `} />
                    <span className="transition-colors duration-200">
                      {item.label}
                    </span>
                    {active && (
                      <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Habits Section */}
            <div>
              <div className="px-4 mb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  🪴 Habits
                </h3>
              </div>
              <div className="space-y-1">
                {habitItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`
                        group flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                        ${active 
                          ? 'bg-emerald-100 text-emerald-700 shadow-md' 
                          : item.isSecondary
                            ? 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-sm ml-2'
                            : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-sm'
                        }
                        hover:scale-105 active:scale-95
                      `}
                    >
                      <Icon className={`
                        w-5 h-5 transition-all duration-200
                        ${active 
                          ? 'text-emerald-600' 
                          : item.isSecondary
                            ? 'text-gray-400 group-hover:text-emerald-600'
                            : 'text-gray-500 group-hover:text-emerald-600'
                        }
                        group-hover:scale-110
                      `} />
                      <span className="transition-colors duration-200">
                        {item.label}
                      </span>
                      {active && (
                        <div className="ml-auto w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4">Please sign in to access your learning dashboard</p>
            <div className="space-y-2">
              <Link
                href="/login"
                className="block w-full py-2 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="block w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}

        {/* Bottom section - Only show if authenticated */}
        {user && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            {/* User Info */}
            <Link href="/profile" className="block mb-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
              <div className="flex items-center gap-3">
                {/* Avatar - 40x40 circle with emoji centered */}
                {profileLoading ? (
                  <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                ) : (
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm border-2 border-white"
                    style={{ backgroundColor: userProfile?.color || '#6b7280' }}
                  >
                    {userProfile?.emoji ? (
                      <span className="text-lg">{userProfile.emoji}</span>
                    ) : (
                      <span className="text-lg">❓</span>
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {profileLoading ? (
                    <>
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {userProfile?.name || user.email}
                      </p>
                      <p className="text-xs text-blue-600">
                        View Profile
                      </p>
                    </>
                  )}
                </div>
              </div>
            </Link>

            {/* Sign Out Button */}
            <SignOutButton variant="sidebar" />

            {/* Tip */}
            <div className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Tip</span>
              </div>
              <p className="text-xs text-blue-700 leading-relaxed">
                Track your learning progress daily for better insights and motivation!
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
} 