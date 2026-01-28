import { defineNuxtModule, createResolver, addImports } from '@nuxt/kit';

const module$1 = defineNuxtModule({
  meta: {
    name: "@tfbuilder/hcl-nuxt",
    configKey: "hcl",
    compatibility: {
      nuxt: ">=3.0.0"
    }
  },
  defaults: {
    defaultIndent: 2,
    quoteStyle: "double"
  },
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url);
    addImports([
      {
        name: "useHcl",
        as: "useHcl",
        from: resolver.resolve("./runtime/composables/useHcl")
      }
    ]);
    addImports([
      {
        name: "serializeBlock",
        as: "serializeBlock",
        from: resolver.resolve("./runtime/serializer")
      },
      {
        name: "serializeToHcl",
        as: "serializeToHcl",
        from: resolver.resolve("./runtime/serializer")
      },
      {
        name: "serializeAttribute",
        as: "serializeAttribute",
        from: resolver.resolve("./runtime/serializer")
      }
    ]);
  }
});

export { module$1 as default };
