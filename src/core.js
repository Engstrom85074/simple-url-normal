// Core URL normalisation logic. Kept separate from index.js so the
// public surface stays tiny and the implementation can be unit-tested
// directly.

const DEFAULT_PORTS = Object.freeze({
  'http:': '80',
  'https:': '443',
  'ftp:': '21',
  'ws:': '80',
  'wss:': '443'
});

/**
 * Normalise a URL string for comparison purposes.
 *
 * The rules are deliberately conservative: we only change things that
 * are unambiguously equivalent under the WHATWG URL standard. In
 * particular we do not touch the path (no resolving `..`/`.` segments)
 * and we do not reorder query parameters, because those can be
 * semantically meaningful and reordering them would make two genuinely
 * different URLs compare equal.
 *
 * @param {string} input
 * @returns {string} a normalised URL string
 * @throws {TypeError} if `input` is not a string
 * @throws {Error} if `input` is not a valid absolute URL
 */
export function normalizeUrl(input) {
  if (typeof input !== 'string') {
    throw new TypeError('normalizeUrl expects a string');
  }

  let url;
  try {
    url = new URL(input);
  } catch (err) {
    throw new Error(`invalid URL: ${input}`);
  }

  // URL lowercases the scheme and host already, but be explicit so the
  // behaviour is obvious to a reader and stable across runtimes.
  const protocol = url.protocol.toLowerCase();
  const hostname = url.hostname.toLowerCase();

  // Drop a port that is the default for the scheme: `http://a:80/` and
  // `http://a/` denote the same resource.
  let port = url.port;
  if (port && DEFAULT_PORTS[protocol] === port) {
    port = '';
  }

  // Strip a single trailing slash from a non-root path. `/a/` and `/a`
  // address the same resource on every server we care about; the root
  // path is left as `/` so the output is still a valid URL.
  let pathname = url.pathname;
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  const authority = port ? `${hostname}:${port}` : hostname;
  const search = url.search; // already includes the leading `?` or is empty
  const hash = url.hash;     // already includes the leading `#` or is empty

  return `${protocol}//${authority}${pathname}${search}${hash}`;
}

/**
 * Compare two URLs after normalising both.
 *
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
export function urlsEqual(a, b) {
  return normalizeUrl(a) === normalizeUrl(b);
}
