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

        // Get the hash from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        if (accessToken && refreshToken) {
          // Set the session
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (error) {
            throw error
          }

          // Get user info to verify email is allowed
          const { data: { user } } = await supabase.auth.getUser()
          
          if (!user?.email) {
            throw new Error('No user email found')
          }

          // Check if email is in allowed list
          const allowedEmails = [
            process.env.NEXT_PUBLIC_ALLOWED_EMAIL_1,
            process.env.NEXT_PUBLIC_ALLOWED_EMAIL_2,
          ].filter(Boolean) as string[]

          // If no allowed emails are configured, allow all authenticated users
          if (allowedEmails.length === 0) {
            console.warn('No allowed emails configured - allowing all authenticated users')
          }

          if (allowedEmails.length > 0 && !allowedEmails.includes(user.email.toLowerCase())) {
            await supabase.auth.signOut()
            throw new Error('Email not authorized for this application')
          }

          setStatus('success')
          setMessage('Authentication successful! Redirecting...')
          
          // Redirect to home page after a short delay
          setTimeout(() => {
            router.push('/')
          }, 2000)
        } else {
          throw new Error('No authentication tokens found')
        }
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