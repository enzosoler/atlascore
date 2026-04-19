/** @type {import('tailwindcss').Config} */
module.exports = {
    presets: [require('./src/redesign/tokens/tailwind.preset.cjs')],
    darkMode: "class",
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		// Override h-screen / min-h-screen / max-h-screen to use --app-height
  		// (set by useViewportHeight hook to window.innerHeight) instead of 100vh.
  		// 100vh on iOS includes the hidden browser chrome, causing overflow.
  		// This fixes all ~91 screens using these classes in one shot.
  		height: {
  			screen: 'var(--app-height)',
  		},
  		minHeight: {
  			screen: 'var(--app-height)',
  		},
  		maxHeight: {
  			screen: 'var(--app-height)',
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			// Atlas design tokens — use these instead of arbitrary values
  			'atlas-card': 'var(--atlas-card-radius)',     // 18px — cards, tiles
  			'atlas-control': 'var(--atlas-control-radius)', // 14px — buttons, inputs, chips
  			'atlas-sheet': 'var(--atlas-sheet-radius)',   // 24px — sheets, modals
  		},
	  		colors: {
	        atlas: {
	          cyan: '#00FFFF',
	          obsidian: '#05070A',
	          white: '#FFFFFF',
	        },
	        semantic: {
	          success: '#10B981',
	          warning: '#F59E0B',
	          error: '#EF4444',
	        },
	        app: 'hsl(var(--bg-app))',
        surface: 'hsl(var(--bg-surface))',
        'surface-2': 'hsl(var(--bg-surface-2))',
        'card-elevated': 'hsl(var(--bg-card-elevated))',
        'border-default': 'hsl(var(--border-default))',
        'border-strong': 'hsl(var(--border-strong))',
        'fg-primary': 'hsl(var(--text-primary))',
        'fg-secondary': 'hsl(var(--text-secondary))',
        'fg-muted': 'hsl(var(--text-muted))',
        'accent-primary': 'hsl(var(--accent-primary))',
        'accent-secondary': 'hsl(var(--accent-secondary))',
        'status-success': 'hsl(var(--status-success))',
        'status-warning': 'hsl(var(--status-warning))',
        'status-danger': 'hsl(var(--status-danger))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
