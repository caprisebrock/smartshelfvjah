// COPY THIS ENTIRE FILE FROM: components/UserMenu.tsx
// Move the complete contents of components/UserMenu.tsx into this file 
import React, { useState } from 'react'
import Link from 'next/link'
import { useUser } from '../hooks/useUser'
import { User, ChevronDown } from 'lucide-react'
import SignOutButton from './SignOutButton'

export default function UserMenu() {
  const { user } = useUser()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) return null

  return (
    <div className="relative">
      {/* User Avatar/Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-blue-600" />
        </div>
        <span className="text-sm font-medium text-gray-700">{user.email}</span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">Account</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          
          <div className="py-2">
            <Link
              href="/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Profile Settings
            </Link>
            <Link
              href="/settings"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Preferences
            </Link>
          </div>
          
          <div className="border-t border-gray-100 pt-2">
            <div className="px-4 py-2">
              <SignOutButton variant="minimal">
                Sign Out
              </SignOutButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 