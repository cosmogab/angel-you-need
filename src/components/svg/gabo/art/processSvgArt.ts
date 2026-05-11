/**
 * Processes a raw Adobe Illustrator SVG export so it can be inlined as
 * a layer of the V1 home scene:
 *
 *  - extracts the inline `<style>` block and rewrites Illustrator's
 *    `.stN` classes to a scope (`.<scope>-stN`) so 4 layers can coexist
 *    in the same DOM without colliding;
 *  - strips the first `<path>` after `</defs>`, which Illustrator emits
 *    as a 1024x1024 background "frame" (M0,0h1024v1024H0V0Z…) and would
 *    otherwise occlude the layers behind it;
 *  - optionally injects an `id` on the first `<g>` of the content so
 *    existing CSS targeting (e.g. `#gabo-halo` for halo-wobble) keeps
 *    working.
 *
 * The processed string is meant to be fed to `dangerouslySetInnerHTML`
 * inside a parent `<svg viewBox="0 0 1024 1024">` wrapper.
 */
export interface ProcessedSvgArt {
  viewBox: string;
  inner: string;
}

export interface ProcessSvgOptions {
  scope: string;
  rootGroupId?: string;
}

export function processSvgArt(raw: string, opts: ProcessSvgOptions): ProcessedSvgArt {
  const viewBox = raw.match(/viewBox="([^"]+)"/)?.[1] ?? '0 0 1024 1024';

  const styleBody = (raw.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? '')
    .replace(/\.st(\d+)/g, `.${opts.scope}-st$1`);

  const afterDefs = raw.split('</defs>')[1] ?? '';
  const beforeSvgClose = afterDefs.split('</svg>')[0] ?? '';

  // Strip the Illustrator-emitted "frame" element: a 1024x1024 background
  // that would otherwise occlude every layer behind it. It's always the
  // first element after </defs> and shows up either as a <path d="M0,…h1024"…/>
  // (older exports) or a <rect width="1024" height="1024"…/> (newer exports).
  let body = beforeSvgClose
    .replace(/^\s*<path[^>]*\bd="M0,\d+h1024[^"]*"\s*\/>\s*/, '')
    .replace(/^\s*<rect[^>]*\bwidth="1024"[^>]*\bheight="1024"[^>]*\/>\s*/, '')
    .replace(/^\s*<rect[^>]*\bheight="1024"[^>]*\bwidth="1024"[^>]*\/>\s*/, '');

  body = body.replace(/class="st(\d+)"/g, `class="${opts.scope}-st$1"`);

  if (opts.rootGroupId) {
    body = body.replace(/<g>/, `<g id="${opts.rootGroupId}">`);
  }

  const inner = `<style>${styleBody}</style>${body}`;
  return { viewBox, inner };
}
