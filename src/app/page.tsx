'use client';

import { Dashboard } from '@/components/Dashboard';
import { Logo } from '@/components/ui/Logo';
import { useEffect, useState } from 'react';
import { getCurrentUser, signOut } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface User {
  email?: string;
  id: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error loading user:', error)
        router.push('/auth/login')
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [router])

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Logo size="lg" className="mb-6 animate-bounce-in" />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Threader...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="nav-glass fixed top-0 left-0 right-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo 
              size="sm" 
              showText 
              className="transition-all duration-300 hover:scale-105"
            />
            
            {/* User Menu */}
            <div className="flex items-center space-x-6">
              <div className="text-sm text-gray-600 font-medium">
                {user?.email}
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-700 hover:text-gray-900 transition-all duration-200 font-medium px-3 py-1.5 rounded-lg hover:bg-white/50 border border-transparent hover:border-gray-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Dashboard */}
      <main className="pt-16">
        <Dashboard />
      </main>
    </div>
  );
}
