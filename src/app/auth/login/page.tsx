'use client'

import { useState } from 'react'
import { signInWithMagicLink } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')
    setIsError(false)

    try {
      await signInWithMagicLink(email)
      setMessage('Check your email for the magic link!')
      setIsError(false)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'An error occurred')
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-25 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl tracking-tight">MT</span>
              </div>
              <div className="absolute -inset-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl opacity-20 blur-sm"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">MasterThreader</h1>
          <p className="text-gray-600">AI-Powered Thread Generation</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Sign In
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending Magic Link...
                </div>
              ) : (
                'Send Magic Link'
              )}
            </button>
          </form>

          {/* Message */}
          {message && (
            <div className={`mt-4 p-4 rounded-lg ${
              isError 
                ? 'bg-red-50 border border-red-200 text-red-700' 
                : 'bg-green-50 border border-green-200 text-green-700'
            }`}>
              <p className="text-sm">{message}</p>
            </div>
          )}

          {/* Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Access is restricted to authorized users only.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Secure authentication via magic link</p>
        </div>
      </div>
    </div>
  )
} 