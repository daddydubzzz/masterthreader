# Logo Integration & Design System

## Overview
MasterThreader now features a unified logo system with support for custom PNG images and professional design consistency across all interfaces.

## Logo Component

### Usage
```tsx
import { Logo } from '@/components/ui/Logo'

// Basic usage
<Logo />

// With custom size and text
<Logo size="lg" showText />

// With variant styling
<Logo size="md" variant="glass" showText />
```

### Props
- `size`: `'sm' | 'md' | 'lg' | 'xl'` - Controls logo dimensions
- `className`: Custom CSS classes
- `showText`: Boolean to display "MasterThreader" text
- `textClassName`: Custom classes for text container
- `variant`: `'default' | 'minimal' | 'glass'` - Visual style variants

### Size Guide
- `sm`: 32px (8x8) - Navigation header
- `md`: 48px (12x12) - Default size
- `lg`: 64px (16x16) - Auth pages, prominent display
- `xl`: 80px (20x20) - Hero sections, landing pages

## Custom Logo Integration

### Adding Your PNG Logo
1. Place your logo file as `/public/logo.png`
2. Recommended dimensions: 512x512px or higher
3. Format: PNG with transparent background
4. The logo will automatically replace the "MT" fallback

### Logo Specifications
- **Format**: PNG (preferred) or SVG
- **Size**: 512x512px minimum
- **Background**: Transparent
- **Style**: Should work on both light and dark backgrounds
- **Padding**: Logo should have internal padding for optimal display

## Design System Updates

### Color Palette
- **Primary**: Sophisticated gray scale (gray-800 to gray-900)
- **Accent**: Emerald green for success states
- **Background**: Subtle gradients from gray-25 to white
- **Text**: High contrast with gray-900 for headings

### Typography
- **Headings**: Semibold weight with tight letter spacing
- **Body**: Medium weight for improved readability
- **Gradient Text**: Subtle gray gradients for brand elements

### Component Enhancements
- **Cards**: Premium styling with enhanced shadows
- **Buttons**: Refined gradients and hover states
- **Inputs**: Larger padding and rounded corners
- **Animations**: Smooth transitions with professional easing

## Implementation Locations

### Logo Usage
1. **Navigation Header** (`src/app/page.tsx`)
   - Size: `sm`
   - Variant: `glass`
   - Shows text: Yes

2. **Login Page** (`src/app/auth/login/page.tsx`)
   - Size: `lg`
   - Variant: `default`
   - Shows text: No (separate heading)

3. **Auth Callback** (`src/app/auth/callback/page.tsx`)
   - Size: `lg`
   - Variant: `default`
   - Shows text: No

### Design Consistency
- All components use the unified design system
- Consistent spacing and typography scales
- Professional color palette throughout
- Smooth animations and transitions

## Performance Considerations
- Logo component uses Next.js Image optimization
- Fallback "MT" text displays instantly
- Custom PNG loads progressively
- Priority loading for above-the-fold logos

## Customization
The Logo component is fully customizable:
- Modify `sizeMap` in `src/components/ui/Logo.tsx` for different dimensions
- Update variants for different visual styles
- Adjust animations and transitions in the component
- Extend with additional props as needed

## Future Enhancements
- Support for SVG logos
- Dark mode variants
- Animated logo transitions
- Brand color customization
- Logo mark vs. wordmark variations 