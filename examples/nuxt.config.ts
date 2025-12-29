export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },

    // Reference the local module
    modules: ['../src/module'],

    // Module options
    hcl: {
        defaultIndent: 2,
    },
});
