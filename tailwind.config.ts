import type { Config } from "tailwindcss";

export default {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // aimen Navy & Gold Theme
                navy: {
                    DEFAULT: '#0A192F',
                    darker: '#050D1A',
                    light: '#112240',
                    lighter: '#1A2F4F',
                },
                gold: {
                    DEFAULT: '#D4AF37',
                    light: '#E5C878',
                    dark: '#B8941F',
                },
                yellow: {
                    bright: '#FDB913',
                },
                background: "var(--background)",
                foreground: "var(--foreground)",
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'shimmer': 'shimmer 2s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' },
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #E5C878 100%)',
                'gradient-navy': 'linear-gradient(135deg, #0A192F 0%, #1A2F4F 100%)',
            },
            boxShadow: {
                'gold': '0 10px 40px rgba(212, 175, 55, 0.3)',
                'gold-lg': '0 20px 60px rgba(212, 175, 55, 0.4)',
                'glow': '0 0 20px rgba(212, 175, 55, 0.2)',
                'glow-lg': '0 0 40px rgba(212, 175, 55, 0.4)',
            },
        },
    },
    plugins: [],
} satisfies Config;
