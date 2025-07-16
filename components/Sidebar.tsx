import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { BookOpen, FileText, Bot, Sparkles, BarChart2, Calendar, PlusCircle, Lightbulb, Settings } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/', icon: BarChart2 },
  { label: 'My Learning', href: '/my-learning', icon: BookOpen },
  { label: 'Notes', href: '/notes', icon: FileText },
  { label: 'Ask AI', href: '/ask-ai', icon: Bot },
  { label: 'Progress', href: '/progress', icon: Calendar },
  { label: 'Add Habit', href: '/add-habit', icon: PlusCircle },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const router = useRouter();
  
  const isActive = (href: string) => {
    if (href === '/') {
      return router.pathname === '/';
    }
    return router.pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 flex-shrink-0 h-screen overflow-y-auto">
      <div className="p-6">
        {/* Logo/Brand */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">SmartShelf</h1>
              <p className="text-sm text-gray-500">Learning Tracker</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
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
        </nav>

        {/* Bottom section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Tip</span>
            </div>
            <p className="text-xs text-blue-700 leading-relaxed">
              Track your learning progress daily for better insights and motivation!
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
} 