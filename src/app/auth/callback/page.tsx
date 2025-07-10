'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        if (!supabase) {
          throw new Error('Supabase client not initialized')
        }

        // Get the current URL to check for auth tokens
        const url = new URL(window.location.href)
        const code = url.searchParams.get('code')
        const error = url.searchParams.get('error')
        const errorDescription = url.searchParams.get('error_description')

        console.log('🔍 Callback URL Debug:');
        console.log('  Full URL:', window.location.href);
        console.log('  Code:', code);
        console.log('  Error:', error);
        console.log('  Error description:', errorDescription);

        if (error) {
          throw new Error(errorDescription || error)
        }

        let user = null

        if (code) {
          // Exchange code for session (PKCE flow)
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (exchangeError) {
            throw exchangeError
          }

          user = data.user
        } else {
          // Try to get existing session (fallback)
          const { data: { user: existingUser } } = await supabase.auth.getUser()
          user = existingUser
        }

        if (!user?.email) {
          throw new Error('No user email found')
        }

        // Check if email is in allowed list
        const allowedEmails = [
          process.env.NEXT_PUBLIC_ALLOWED_EMAIL_1,
          process.env.NEXT_PUBLIC_ALLOWED_EMAIL_2,
        ].filter(Boolean) as string[]

        // Debug logging
        console.log('🔍 Auth Callback Debug:');
        console.log('  User email:', user.email);
        console.log('  Allowed emails:', allowedEmails);
        console.log('  Email check:', allowedEmails.includes(user.email.toLowerCase()));

        // If no allowed emails are configured, allow all authenticated users
        if (allowedEmails.length === 0) {
          console.warn('No allowed emails configured - allowing all authenticated users')
        }

        if (allowedEmails.length > 0 && !allowedEmails.includes(user.email.toLowerCase())) {
          console.error('❌ Email not in allowed list');
          await supabase.auth.signOut()
          throw new Error('Email not authorized for this application')
        }

        console.log('✅ Email validation passed');

        setStatus('success')
        setMessage('Authentication successful! Redirecting...')
        
        // Redirect to home page after a short delay
        setTimeout(() => {
          router.push('/')
        }, 2000)
      } catch (error) {
        console.error('Auth callback error:', error)
        setStatus('error')
        setMessage(error instanceof Error ? error.message : 'Authentication failed')
        
        // Redirect to login after error
        setTimeout(() => {
          router.push('/auth/login')
        }, 3000)
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-25 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl tracking-tight">MT</span>
            </div>
            <div className="absolute -inset-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl opacity-20 blur-sm"></div>
          </div>
        </div>

        {/* Status Display */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {status === 'loading' && (
            <div>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Authenticating...
              </h2>
              <p className="text-gray-600">Please wait while we verify your access.</p>
            </div>
          )}

          {status === 'success' && (
            <div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Welcome!
              </h2>
              <p className="text-gray-600">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Authentication Failed
              </h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">Redirecting to login...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 