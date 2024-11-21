/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.{html,js}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  safelist: [
    'text-gray-700',
    'text-base',
    'font-semibold',
    'mb-4',
    'text-center',
    'w-full',
    'bg-white',
    'rounded-xl',
    'shadow-sm',
    'p-6',
    'flex',
    'flex-col',
    'items-center',
    'justify-center',
    'min-h-[200px]',
    'transition-all',
    'hover:shadow-md',
    // Chat interface classes
    'bg-blue-600',
    'text-white',
    'font-medium',
    'hover:bg-blue-700',
    'active:bg-blue-800',
    'hover:shadow',
    'bg-gray-50',
    'focus:ring-2',
    'focus:ring-blue-500',
    'focus:border-transparent'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4CAF50',
        'primary-dark': '#45a049',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

