'use client';

import { Dashboard } from '@/components/Dashboard';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-25 via-white to-gray-50">
      {/* Navigation */}
      <nav className="nav-glass fixed top-0 left-0 right-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm tracking-tight">MT</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl opacity-20 blur-sm"></div>
              </div>
              <div>
                <h1 className="text-xl font-semibold gradient-text tracking-tight">MasterThreader</h1>
                <span className="text-xs text-gray-500 font-medium">AI Copy Refinement Engine</span>
              </div>
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
