import Image from 'next/image'
import { useState } from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  className?: string
  showText?: boolean
  textClassName?: string
  variant?: 'default' | 'minimal' | 'glass'
}

const sizeMap = {
  sm: { 
    container: 'w-12 h-12', 
    text: 'text-lg', 
    blur: '-inset-1',
    borderRadius: 'rounded-lg',
    textSize: 'text-lg'
  },
  md: { 
    container: 'w-16 h-16', 
    text: 'text-xl', 
    blur: '-inset-1.5',
    borderRadius: 'rounded-xl',
    textSize: 'text-xl'
  },
  lg: { 
    container: 'w-24 h-24', 
    text: 'text-3xl', 
    blur: '-inset-2',
    borderRadius: 'rounded-2xl',
    textSize: 'text-2xl'
  },
  xl: { 
    container: 'w-32 h-32', 
    text: 'text-4xl', 
    blur: '-inset-3',
    borderRadius: 'rounded-3xl',
    textSize: 'text-3xl'
  },
  xxl: { 
    container: 'w-48 h-48', 
    text: 'text-6xl', 
    blur: '-inset-4',
    borderRadius: 'rounded-3xl',
    textSize: 'text-4xl'
  }
}

export function Logo({ 
  size = 'md', 
  className = '', 
  showText = false, 
  textClassName = '',
  variant = 'default'
}: LogoProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const { container, text, blur, borderRadius, textSize } = sizeMap[size]
  
  const getContainerStyles = () => {
    // Remove all circle backgrounds - just return basic container for sizing
    return `${container} flex items-center justify-center relative`
  }
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative group">
        <div className={getContainerStyles()}>
          {/* Custom logo image */}
          {!imageError && (
            <Image
              src="/logo.png"
              alt="Threader Logo"
              fill
              className={`object-contain transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              priority={size === 'lg' || size === 'xl' || size === 'xxl'}
            />
          )}
          
          {/* Fallback T text */}
          <span 
            className={`text-gray-800 font-bold ${text} tracking-tight relative z-10 transition-opacity duration-300 ${
              imageLoaded && !imageError ? 'opacity-0' : 'opacity-100'
            } drop-shadow-sm`}
          >
            T
          </span>
        </div>
      </div>
      
      {showText && (
        <div className={textClassName}>
          <h1 className={`font-semibold bg-gradient-to-r from-gold-600 to-gold-500 bg-clip-text text-transparent tracking-tight ${textSize} drop-shadow-sm`}>
            Threader
          </h1>
        </div>
      )}
    </div>
  )
} 