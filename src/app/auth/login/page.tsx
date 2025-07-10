'use client'

import { useState } from 'react'
import { signInWithMagicLink } from '@/lib/supabase'
import { Logo } from '@/components/ui/Logo'

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
    <div className="min-h-screen bg-gradient-to-br from-cream-25 via-cream-50 to-cream-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Logo 
              size="xxl" 
              className="transition-all duration-300 hover:scale-105"
            />
          </div>
          <h1 className="text-6xl font-light gradient-text tracking-wide leading-none" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', letterSpacing: '0.05em' }}>
            Threader
          </h1>
        </div>

        {/* Login Form */}
        <div className="card-premium rounded-2xl shadow-2xl p-8 animate-slide-up bg-gradient-to-br from-cream-50/90 to-cream-100/90 border border-gold-200/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input w-full px-4 py-4 border border-gold-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all duration-200 text-platinum-900 placeholder-platinum-400 bg-cream-50/50 text-center"
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="btn btn-primary w-full py-4 px-4 rounded-xl font-semibold text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-gold-600 to-gold-700 hover:from-gold-700 hover:to-gold-800 focus:ring-4 focus:ring-gold-200 shadow-lg text-white"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending...
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
        </div>
      </div>
    </div>
  )
} 