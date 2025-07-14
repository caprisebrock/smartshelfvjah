import React from 'react';
import Link from 'next/link';
import { BookOpen, FileText, Bot, Sparkles, BarChart2, Calendar, PlusCircle, Lightbulb } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/', icon: <BarChart2 className="w-5 h-5 mr-2" /> },
  { label: '📚 My Learning', href: '/my-learning', icon: <BookOpen className="w-5 h-5 mr-2" /> },
  { label: 'Log Notes', href: '/notes', icon: <FileText className="w-5 h-5 mr-2" /> },
  { label: 'Ask AI', href: '/ai', icon: <Bot className="w-5 h-5 mr-2" /> },
  { label: 'Progress', href: '/progress', icon: <Calendar className="w-5 h-5 mr-2" /> },
  { label: 'Add Habit', href: '/add-habit', icon: <PlusCircle className="w-5 h-5 mr-2" /> },
  // { label: 'Insights', href: '/insights', icon: <Lightbulb className="w-5 h-5 mr-2" />, disabled: true }, // Temporarily hidden
  { label: 'Settings', href: '/settings', icon: <BarChart2 className="w-5 h-5 mr-2" /> },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-100 border-r border-gray-200 p-4 flex-shrink-0 h-screen overflow-y-auto">
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-gray-800 hover:bg-blue-100 transition-colors"
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
} 