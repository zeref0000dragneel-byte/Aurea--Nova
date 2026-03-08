import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
		colors: {
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
				DEFAULT: '#F4C430',
				foreground: 'hsl(var(--primary-foreground))',
				dark: '#DAA520',
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
			success: '#6B8E23',
			warning: '#FFB74D',
			danger: '#C85A17',
			'primary-dark': '#DAA520',
			'accent-miel': '#FFE082',
			neutral: {
				50: '#FEF9F2',
				100: '#FFF8F0',
				200: '#E8DCC8',
				700: '#3E2723',
				800: '#2A1A12',
			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
  			serif: ['Playfair Display', 'Georgia', 'serif'],
  			display: ['Playfair Display', 'Georgia', 'serif'],
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		borderWidth: {
  			'0.5': '0.5px'
  		},
  		borderOpacity: {
  			'50': '0.5'
  		},
		boxShadow: {
			sm: '0 2px 4px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.7)',
			DEFAULT: '0 4px 14px 0 rgba(0,0,0,0.05), 0 2px 4px 0 rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.8), 0 0 0 1px rgba(0,0,0,0.03)',
			md: '0 12px 32px -4px rgba(0,0,0,0.08), 0 4px 12px -4px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9), 0 0 0 1px rgba(0,0,0,0.02)',
			lg: '0 24px 48px -12px rgba(0,0,0,0.12), 0 12px 24px -8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1), 0 0 0 1px rgba(0,0,0,0.02)',
			'glow-miel': '0 0 24px rgba(255,224,130,0.4)',
		},
  		letterSpacing: {
  			'tight-premium': '-0.02em'
  		},
  		fontSize: {
  			'xs-premium': ['0.75rem', { lineHeight: '1.4' }],
  			'sm-premium': ['0.8125rem', { lineHeight: '1.4' }]
  		},
  		keyframes: {
  			'pulse-slow': {
  				'0%, 100%': { opacity: '1' },
  				'50%': { opacity: '0.5' }
  			}
  		},
  		animation: {
  			'pulse-slow': 'pulse-slow 1s ease-in-out infinite'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
