/**
 * This plugin is used to prevent the Flash Of Unstyled Content (FOUC) in browsers
 * that do not support native Declarative Shadow Dom (DSD).
 *
 * This is done by adding a "dsd-pending" attribute to the body element if the browser
 * does not support native DSD. This attribute hides the body element until the
 * polyfill has been loaded and applied. Thereby, preventing the FOUC.
 */
declare const _default: any;
export default _default;
