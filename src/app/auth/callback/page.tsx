'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Logo } from '@/components/ui/Logo'

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (!supabase) {
      setStatus('error')
      setMessage('Supabase client not initialized')
      return
    }

    console.log('🔍 Callback URL Debug:');
    console.log('  Full URL:', window.location.href);

    // Listen for auth state changes (supabase is guaranteed to be non-null here)
    const { data: { subscription } } = supabase!.auth.onAuthStateChange(async (event, session) => {
      console.log('🔍 Auth State Change:', event, session?.user?.email);

      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const user = session.user

          if (!user.email) {
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
            if (supabase) {
              await supabase.auth.signOut()
            }
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
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out')
        setStatus('error')
        setMessage('Authentication failed')
        setTimeout(() => {
          router.push('/auth/login')
        }, 3000)
      }
    })

    // Check for immediate auth errors in URL
    const url = new URL(window.location.href)
    const error = url.searchParams.get('error')
    const errorDescription = url.searchParams.get('error_description')

    if (error) {
      console.error('Auth URL error:', error, errorDescription)
      setStatus('error')
      setMessage(errorDescription || error)
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
    }

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-25 via-cream-50 to-cream-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo 
            size="lg" 
            className="transition-all duration-300"
          />
        </div>

        {/* Status Display */}
        <div className="card-premium rounded-2xl shadow-2xl p-8 bg-gradient-to-br from-cream-50/90 to-cream-100/90 border border-gold-200/50">
          {status === 'loading' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600 mx-auto mb-6"></div>
              <h2 className="text-xl font-semibold text-platinum-900 mb-3">
                Authenticating...
              </h2>
              <p className="text-platinum-600 font-medium">Please wait while we verify your access.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-platinum-900 mb-3">
                Welcome!
              </h2>
              <p className="text-platinum-600 font-medium">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-platinum-900 mb-3">
                Authentication Failed
              </h2>
              <p className="text-platinum-600 font-medium mb-4">{message}</p>
              <p className="text-sm text-platinum-500">Redirecting to login...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 