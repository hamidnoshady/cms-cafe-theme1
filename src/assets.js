import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

/**
 * One cache-busting token for the static files this theme serves itself.
 *
 * They are served with `max-age=3600`, so without a token every deploy is
 * invisible to a returning visitor for an hour — and worse, the browser pairs the
 * *new* HTML with the *old* `app.js`, which is exactly the window in which a
 * markup change and a script change disagree. Hashing the bytes means the URL
 * changes when the files change and not otherwise, so the cache stays useful.
 *
 * The token is computed once per process, which is what a deploy replaces.
 */
const FILES = ['style.css', 'cms.css', 'money.js', 'app.js'];
const UI_FILES = ['public/ui/theme-ui.css', 'public/ui/theme-ui.js'];

const contents = await Promise.all(
  FILES.map((file) => readFile(new URL(`../${file}`, import.meta.url))),
);

const uiContents = await Promise.all(
  UI_FILES.map((file) => readFile(new URL(`../${file}`, import.meta.url)).catch(() => Buffer.alloc(0))),
);

export const assetVersion = createHash('sha256')
  .update(Buffer.concat([...contents, ...uiContents]))
  .digest('hex')
  .slice(0, 10);

/** `/app.js?v=1a2b3c4d5e` — the query is ignored by the static handler. */
export const asset = (file) => `/${file}?v=${assetVersion}`;

/** `/public/ui/theme-ui.css?v=1a2b3c4d5e` — versioned shadcn/ui bundle asset. */
export const uiAsset = (file) => `/public/ui/${file}?v=${assetVersion}`;

/** The root static files `server.js` serves, verified against Dockerfile COPY. */
export const staticFilesList = [...FILES];
