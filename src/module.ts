import { defineNuxtModule, addImports, createResolver } from '@nuxt/kit';
import type { ModuleOptions } from './runtime/types';

export default defineNuxtModule<ModuleOptions>({
    meta: {
        name: '@tfbuilder/hcl-nuxt',
        configKey: 'hcl',
        compatibility: {
            nuxt: '>=3.0.0',
        },
    },
    defaults: {
        defaultIndent: 2,
        quoteStyle: 'double',
    },
    setup(_options, _nuxt) {
        const resolver = createResolver(import.meta.url);

        // Auto-import composables
        addImports([
            {
                name: 'useHcl',
                as: 'useHcl',
                from: resolver.resolve('./runtime/composables/useHcl'),
            },
        ]);

        // Make serializer functions available for direct import
        addImports([
            {
                name: 'serializeBlock',
                as: 'serializeBlock',
                from: resolver.resolve('./runtime/serializer'),
            },
            {
                name: 'serializeToHcl',
                as: 'serializeToHcl',
                from: resolver.resolve('./runtime/serializer'),
            },
            {
                name: 'serializeAttribute',
                as: 'serializeAttribute',
                from: resolver.resolve('./runtime/serializer'),
            },
        ]);
    },
});
