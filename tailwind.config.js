import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
                display: ['Sora', 'Inter', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                // Brand accent — kept under the `gold` key so the whole app
                // recolours at once, but the ramp is now a vibrant violet.
                gold: {
                    50: '#f5f3ff',
                    100: '#ede9fe',
                    200: '#ddd6fe',
                    300: '#c4b5fd',
                    400: '#a78bfa',
                    500: '#8b5cf6',
                    600: '#7c3aed',
                    700: '#6d28d9',
                },
                // Secondary pop — coral/rose, used for gradients + highlights.
                pop: {
                    300: '#fda4af',
                    400: '#fb7185',
                    500: '#f43f5e',
                    600: '#e11d48',
                },
                ink: {
                    950: '#080611',
                    900: '#0d0a1a',
                    800: '#141126',
                    700: '#1e1836',
                    600: '#2a2148',
                    500: '#3a2f60',
                },
            },
            boxShadow: {
                gold: '0 12px 40px -12px rgba(124, 58, 237, 0.45)',
                pop: '0 12px 40px -12px rgba(244, 63, 94, 0.40)',
            },
            backgroundImage: {
                'brand-grad': 'linear-gradient(135deg, #7c3aed 0%, #d946ef 45%, #f43f5e 100%)',
            },
        },
    },

    plugins: [forms],
};
