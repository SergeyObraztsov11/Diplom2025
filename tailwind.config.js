/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
        "./src/App.vue",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "main-black": "#181818",
                "main-white": "#e6e6e6",
                "main-gray": "#222222",
                "main-light-gray": "#b1adb5",
                "main-color": "#1E90FF",
                "main-error-red": "#ef4444",
            },
            fontFamily: {
                'inter': ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [
        function ({ addComponents }) {
            addComponents({
                ".skeleton": {
                    "@apply animate-pulse bg-main-white dark:bg-main-gray rounded": {},
                },
            });
        },
    ],
};
