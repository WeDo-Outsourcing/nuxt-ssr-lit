import "@lit-labs/ssr/lib/render-lit-html.js";
declare const _default: import("vue").DefineComponent<{}, {}, {
    litElementVnode: any;
    litElementTagName: any;
    litSsrHtml: string;
    renderer: null;
}, {}, {
    resolveSlots(): Promise<any[]>;
    attachPropsToRenderer(): void;
    getAttributesToRender(): {
        [k: string]: any;
    };
    getShadowContents(): any;
    iterableToString(iterable: Iterable<string>): string;
}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{}>>, {}>;
export default _default;
