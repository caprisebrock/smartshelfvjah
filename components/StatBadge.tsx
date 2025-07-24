import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatBadgeProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'yellow' | 'red' | 'gray';
  className?: string;
}

const colorVariants = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    labelColor: 'text-blue-900 dark:text-blue-300',
    valueColor: 'text-blue-700 dark:text-blue-400'
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400',
    labelColor: 'text-green-900 dark:text-green-300',
    valueColor: 'text-green-700 dark:text-green-400'
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
    labelColor: 'text-purple-900 dark:text-purple-300',
    valueColor: 'text-purple-700 dark:text-purple-400'
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-900/30',
    iconColor: 'text-orange-600 dark:text-orange-400',
    labelColor: 'text-orange-900 dark:text-orange-300',
    valueColor: 'text-orange-700 dark:text-orange-400'
  },
  yellow: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/30',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    labelColor: 'text-yellow-900 dark:text-yellow-300',
    valueColor: 'text-yellow-700 dark:text-yellow-400'
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
    labelColor: 'text-red-900 dark:text-red-300',
    valueColor: 'text-red-700 dark:text-red-400'
  },
  gray: {
    bg: 'bg-gray-50 dark:bg-gray-800',
    iconColor: 'text-gray-600 dark:text-gray-400',
    labelColor: 'text-gray-900 dark:text-gray-300',
    valueColor: 'text-gray-700 dark:text-gray-400'
  }
};

export default function StatBadge({ icon: Icon, label, value, color, className = '' }: StatBadgeProps) {
  const colors = colorVariants[color];
  
  return (
    <div className={`flex items-center justify-between p-3 ${colors.bg} rounded-xl ${className}`}>
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${colors.iconColor}`} />
        <span className={`text-sm font-medium ${colors.labelColor}`}>{label}</span>
      </div>
      <span className={`text-sm font-bold ${colors.valueColor}`}>{value}</span>
    </div>
  );
}

// For larger stat displays (like in dashboard cards)
interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'yellow' | 'red' | 'gray';
  className?: string;
}

export function StatCard({ icon: Icon, label, value, color, className = '' }: StatCardProps) {
  const colors = colorVariants[color];
  
  return (
    <div className={`text-center ${className}`}>
      <div className={`text-3xl font-bold ${colors.valueColor} mb-2`}>
        {value}
      </div>
      <div className={`text-sm ${colors.iconColor}`}>{label}</div>
    </div>
  );
} 