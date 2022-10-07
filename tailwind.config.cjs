const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    theme: {
        extend: {
            fontFamily: {
                'mono': ['Fira Mono']
            }
        },
    },
    darkMode: 'class',
    plugins: [
        plugin(({ addVariant }) => {
            addVariant("toastbar", ['& ._toastBar._toastBar::-webkit-progress-value', '& ._toastBar._toastBar::-moz-progress-bar']);
        })
    ],
};
