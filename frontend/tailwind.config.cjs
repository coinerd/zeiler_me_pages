/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{astro,js,jsx,ts,tsx,md,mdx}',
    './public/**/*.html',
  ],
  darkMode: 'media',
  theme: {
    extend: {
      fontFamily: {
        // Academic Editorial typography
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        'nav-display': ['"Playfair Display"', 'Georgia', 'serif'],
        'nav-label': ['"Cormorant Garamond"', 'Georgia', 'serif'],
        serif: ['"Crimson Pro"', 'Georgia', 'serif'],
        'nav-accent': ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // Primary colors - Academic Editorial palette
        ink: {
          DEFAULT: '#1a2332',        // Deep ink blue
          light: '#2d3a4f',          // Lighter ink
        },
        cream: {
          DEFAULT: '#faf8f5',          // Paper-like background
          dark: '#f5f2ed',           // Darker cream for cards
        },
        amber: {
          DEFAULT: '#d4a373',         // Warm amber accent
          dark: '#b8895a',           // Darker amber for hover
          light: '#e8c9a8',          // Light amber for backgrounds
        },
        sage: {
          DEFAULT: '#8b9a7d',        // Muted sage secondary
        },
        rust: {
          DEFAULT: '#c4785a',        // Warm rust tertiary
        },
        // Navigation section accents
        'section-deutsch': '#c4785a',      // Rust
        'section-geschichte': '#8b9a7d',    // Sage
        'section-medien': '#d4a373',       // Amber
        'section-projekte': '#2d3a4f',     // Ink Light
        'section-techzap': '#5a5145',      // Gray 700
        // Neutral grays
        gray: {
          50: '#f9f8f6',
          100: '#f0ede8',
          200: '#e5e0d8',
          300: '#d4cfc4',
          400: '#b8b0a4',
          500: '#9a9082',
          600: '#7a6f60',
          700: '#5a5145',
          800: '#3d362e',
          900: '#25201b',
        },
      },
      fontSize: {
        // Editorial typography scale
        'xs': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.02em' }],
        'sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
        'base': ['1.125rem', { lineHeight: '1.7', letterSpacing: '0' }],
        'lg': ['1.25rem', { lineHeight: '1.4', letterSpacing: '0' }],
        'xl': ['1.5rem', { lineHeight: '1.3', letterSpacing: '0' }],
        '2xl': ['1.75rem', { lineHeight: '1.3', letterSpacing: '0' }],
        '3xl': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        '4xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '72': '18rem',
        '80': '20rem',
        '96': '24rem',
        '112': '28rem',
        // Navigation spacing scale
        'nav-xs': '0.5rem',   // 8px
        'nav-sm': '1rem',     // 16px
        'nav-md': '1.5rem',   // 24px
        'nav-lg': '2.5rem',   // 40px
        'nav-xl': '4rem',     // 64px
        'nav-2xl': '6rem',    // 96px
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'editorial': '0 1px 3px rgba(26, 35, 50, 0.05)',
        'editorial-hover': '0 4px 12px rgba(26, 35, 50, 0.1)',
        'dropdown': '0 10px 40px rgba(0, 0, 0, 0.1)',
        'nav-item': '0 12px 40px rgba(26, 35, 50, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 400ms ease-out',
        'slide-down': 'slideDown 300ms ease-out',
        'slide-up': 'slideUp 400ms ease-out',
        'stagger-1': 'fadeIn 300ms ease-out 100ms both',
        'stagger-2': 'fadeIn 300ms ease-out 150ms both',
        'stagger-3': 'fadeIn 300ms ease-out 200ms both',
        'stagger-4': 'fadeIn 300ms ease-out 250ms both',
        'stagger-5': 'fadeIn 300ms ease-out 300ms both',
        'stagger-6': 'fadeIn 300ms ease-out 350ms both',
        // Navigation animations
        'nav-backdrop': 'navBackdrop 200ms var(--ease-editorial)',
        'nav-scale-up': 'navScaleUp 400ms var(--ease-page-turn)',
        'nav-slide-up': 'navSlideUp 500ms var(--ease-reveal)',
        'nav-item-reveal': 'navItemReveal 400ms var(--ease-reveal)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Navigation keyframes
        navBackdrop: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        navScaleUp: {
          '0%': { opacity: '0', transform: 'scale(0.95) translateY(20px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        navSlideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        navItemReveal: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'paper-pattern': 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)',
        'nav-noise': 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.03\'/%3E%3C/svg%3E")',
        'nav-gradient-mesh': 'radial-gradient(ellipse at 20% 20%, rgba(212, 163, 115, 0.04) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(139, 154, 125, 0.03) 0%, transparent 50%)',
      },
    },
    // Typography customization for prose content
    typography: (theme) => ({
      DEFAULT: {
        css: {
          // Use our custom fonts
          '--tw-font-serif': theme('fontFamily.serif'),
          '--tw-font-sans': theme('fontFamily.sans'),
          // Colors matching the theme
          color: theme('colors.ink'),
          maxWidth: '65ch',
          // Headings
          h1: {
            fontFamily: theme('fontFamily.display'),
            fontWeight: '700',
            color: theme('colors.ink'),
            marginTop: '2.5rem',
            marginBottom: '1rem',
          },
          h2: {
            fontFamily: theme('fontFamily.display'),
            fontWeight: '600',
            color: theme('colors.ink'),
            marginTop: '2rem',
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid ' + theme('colors.gray.200'),
          },
          h3: {
            fontFamily: theme('fontFamily.display'),
            fontWeight: '600',
            color: theme('colors.ink'),
            marginTop: '1.5rem',
            marginBottom: '0.75rem',
          },
          h4: {
            fontFamily: theme('fontFamily.display'),
            fontWeight: '600',
            color: theme('colors.gray.800'),
            marginTop: '1.25rem',
            marginBottom: '0.5rem',
          },
          // Paragraphs
          p: {
            marginTop: '1rem',
            marginBottom: '1rem',
          },
          // Links
          a: {
            color: theme('colors.amber.dark'),
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
            textDecorationThickness: '1px',
            transition: 'all 200ms ease-out',
            '&:hover': {
              color: theme('colors.amber'),
              textDecorationThickness: '2px',
            },
          },
          // Lists
          'ul, ol': {
            marginTop: '1rem',
            marginBottom: '1rem',
            paddingLeft: '1.5rem',
          },
          li: {
            marginTop: '0.5rem',
            marginBottom: '0.5rem',
            paddingLeft: '0.5rem',
          },
          'ul > li::marker': {
            color: theme('colors.amber'),
          },
          'ol > li::marker': {
            color: theme('colors.amber.dark'),
            fontWeight: '600',
          },
          // Blockquotes
          blockquote: {
            fontFamily: theme('fontFamily.serif'),
            fontStyle: 'italic',
            color: theme('colors.gray.600'),
            borderLeftWidth: '3px',
            borderLeftColor: theme('colors.amber'),
            paddingLeft: '1.5rem',
            marginLeft: '0',
            marginRight: '0',
            marginTop: '1.5rem',
            marginBottom: '1.5rem',
            fontSize: '1.125rem',
            lineHeight: '1.6',
          },
          // Code
          code: {
            fontFamily: theme('fontFamily.mono'),
            fontSize: '0.875em',
            backgroundColor: theme('colors.gray.100'),
            color: theme('colors.amber.dark'),
            padding: '0.2em 0.4em',
            borderRadius: '0.25em',
            fontWeight: '500',
          },
          pre: {
            fontFamily: theme('fontFamily.mono'),
            backgroundColor: theme('colors.gray.900'),
            color: theme('colors.gray.100'),
            borderRadius: '0.5em',
            padding: '1rem',
            marginTop: '1.5rem',
            marginBottom: '1.5rem',
            overflowX: 'auto',
            code: {
              backgroundColor: 'transparent',
              color: 'inherit',
              padding: '0',
            },
          },
          // Images in prose
          img: {
            borderRadius: '0.5em',
            marginTop: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: theme('boxShadow.editorial'),
          },
          // Tables
          table: {
            marginTop: '1.5rem',
            marginBottom: '1.5rem',
            width: '100%',
            borderCollapse: 'collapse',
          },
          th: {
            fontFamily: theme('fontFamily.display'),
            fontWeight: '600',
            color: theme('colors.ink'),
            backgroundColor: theme('colors.gray.100'),
            padding: '0.75rem 1rem',
            textAlign: 'left',
            borderBottom: '2px solid ' + theme('colors.gray.200'),
          },
          td: {
            padding: '0.75rem 1rem',
            borderBottom: '1px solid ' + theme('colors.gray.200'),
            color: theme('colors.gray.700'),
          },
          // Horizontal rule
          hr: {
            borderColor: theme('colors.gray.200'),
            marginTop: '3rem',
            marginBottom: '3rem',
            borderWidth: '1px',
            borderTop: '1px solid ' + theme('colors.gray.200'),
            marginTop: '2px',
          },
          // Strong
          strong: {
            color: theme('colors.ink'),
            fontWeight: '600',
          },
        },
      },
      // Dark mode
      invert: {
        css: {
          color: theme('colors.cream'),
          h1: { 
            color: theme('colors.cream'),
            borderBottomColor: theme('colors.gray.700'),
          },
          h2: { 
            color: theme('colors.cream'),
            borderBottomColor: theme('colors.gray.700'),
          },
          h3: { color: theme('colors.cream') },
          h4: { color: theme('colors.gray.300') },
          a: {
            color: theme('colors.amber'),
            '&:hover': {
              color: theme('colors.amber.light'),
            },
          },
          blockquote: {
            color: theme('colors.gray.400'),
            borderLeftColor: theme('colors.amber'),
          },
          code: {
            backgroundColor: theme('colors.gray.800'),
            color: theme('colors.amber'),
          },
          pre: {
            backgroundColor: theme('colors.gray.900'),
          },
          th: {
            backgroundColor: theme('colors.gray.800'),
            color: theme('colors.cream'),
            borderBottomColor: theme('colors.gray.700'),
          },
          td: {
            borderBottomColor: theme('colors.gray.700'),
            color: theme('colors.gray.300'),
          },
          hr: {
            borderColor: theme('colors.gray.700'),
          },
          strong: {
            color: theme('colors.cream'),
          },
        },
      },
    }),
  },
  plugins: [require('@tailwindcss/typography')],
};
