import { defineNuxtModule, createResolver, addPlugin, addComponent, addVitePlugin, resolveModule } from '@nuxt/kit';
import { pathToFileURL } from 'node:url';
import { parseURL } from 'ufo';
import { parse, walk, ELEMENT_NODE, render } from 'ultrahtml';

const name = "nuxt-ssr-lit";
const version = "1.4.1";

const V_FOR_DIRECTIVE = "v-for";
const V_FOR_KEY_DIRECTIVE = ":key";
const V_IF_DIRECTIVE = "v-if";
const V_ELSE_IF_DIRECTIVE = "v-else-if";
const V_ELSE_DIRECTIVE = "v-else";
function transferDirectiveToWrapper(node, wrapper, directive) {
  if (directive in node.attributes) {
    wrapper.attributes[directive] = node.attributes[directive];
    delete node.attributes[directive];
  }
}
function autoLitWrapper({ litElementPrefix = [] }) {
  return {
    name: "autoLitWrapper",
    async transform(code, id) {
      const litElementPrefixes = Array.isArray(litElementPrefix) ? litElementPrefix : [litElementPrefix];
      const { pathname } = parseURL(decodeURIComponent(pathToFileURL(id).href));
      const isVueFile = pathname.endsWith(".vue");
      if (!isVueFile || id.includes("macro=true")) {
        return;
      }
      const template = code.match(/<template>([\s\S]*)<\/template>/);
      if (!template) {
        return;
      }
      if (!litElementPrefixes.some((prefix) => code.includes(`<${prefix}`))) {
        return;
      }
      const prefixRegex = new RegExp(`^(${litElementPrefixes.join("|")})`, "i");
      const ast = parse(code);
      await walk(ast, (node) => {
        if (node.type !== ELEMENT_NODE || !prefixRegex.test(node.name)) {
          return;
        }
        const wrapper = {
          name: "LitWrapper",
          type: ELEMENT_NODE,
          parent: node.parent,
          children: [node],
          attributes: {},
          loc: node.loc
        };
        if (node.attributes[V_FOR_DIRECTIVE]) {
          transferDirectiveToWrapper(node, wrapper, V_FOR_DIRECTIVE);
          transferDirectiveToWrapper(node, wrapper, V_FOR_KEY_DIRECTIVE);
        }
        transferDirectiveToWrapper(node, wrapper, V_IF_DIRECTIVE);
        transferDirectiveToWrapper(node, wrapper, V_ELSE_IF_DIRECTIVE);
        transferDirectiveToWrapper(node, wrapper, V_ELSE_DIRECTIVE);
        delete node.attributes[""];
        node.parent.children.splice(node.parent.children.indexOf(node), 1, wrapper);
      });
      const transformedCode = await render(ast);
      return {
        code: transformedCode,
        map: null
      };
    }
  };
}

const module = defineNuxtModule({
  meta: {
    name,
    version,
    configKey: "ssrLit"
  },
  defaults: {
    litElementPrefix: []
  },
  async setup(options, nuxt) {
    nuxt.options.nitro.moduleSideEffects = nuxt.options.nitro.moduleSideEffects || [];
    nuxt.options.nitro.moduleSideEffects.push("@lit-labs/ssr/lib/render-lit-html.js");
    const { resolve } = createResolver(import.meta.url);
    const resolveRuntimeModule = (path) => resolveModule(path, { paths: resolve("./runtime") });
    addPlugin(resolveRuntimeModule("./plugins/antiFouc.server"));
    addPlugin(resolveRuntimeModule("./plugins/polyfill.client"));
    addPlugin(resolveRuntimeModule("./plugins/hydrateSupport.client"));
    await addComponent({
      name: "LitWrapper",
      filePath: resolve("./runtime/components/LitWrapper.vue")
    });
    await addComponent({
      name: "LitWrapperClient",
      filePath: resolve("./runtime/components/LitWrapperClient")
    });
    await addComponent({
      name: "LitWrapperServer",
      filePath: resolve("./runtime/components/LitWrapperServer"),
      // mode: "server"
    });
    const isCustomElement = nuxt.options.vue.compilerOptions.isCustomElement || (() => false);
    nuxt.options.vue.compilerOptions.isCustomElement = (tag) => (Array.isArray(options.litElementPrefix) ? options.litElementPrefix.some((p) => tag.startsWith(p)) : tag.startsWith(options.litElementPrefix)) || isCustomElement(tag);
    addVitePlugin(
      autoLitWrapper({
        litElementPrefix: options.litElementPrefix
      })
    );
  }
});

export { module as default };
