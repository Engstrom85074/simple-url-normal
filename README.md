# simple-url-normal

Normalise URLs so that two URLs that address the same resource compare equal.

```js
import { normalizeUrl, urlsEqual } from './src/index.js';

normalizeUrl('HTTP://Example.COM:80/a/');
// => 'http://example.com/a'

urlsEqual('HTTP://Example.COM:80/a/', 'http://example.com/a');
// => true
```

## Why this exists

Comparing URLs as raw strings is almost always wrong: `HTTP://example.com:80/a/`
and `http://example.com/a` are the same address, but a `===` check says they are
different. This library applies a small, conservative set of normalisations so
that the common cases collapse to a single canonical form.

The trade-off is deliberate: we only change things that are unambiguously
equivalent under the WHATWG URL standard. We lower-case the scheme and host,
drop a port that is the default for the scheme, and strip a single trailing
slash from a non-root path. We do **not** resolve `..`/`.` path segments, we do
**not** reorder or drop query parameters, and we do **not** strip fragments.
Those operations can change which resource is addressed, and a comparator that
silently equates two different resources is worse than one that misses an
equivalence.

## The awkward edge

A trailing slash is stripped from `/a/` but not from `/`. The root path stays
as `/` so the result is still a valid absolute URL; `http://example.com` and
`http://example.com/` both normalise to `http://example.com/`.

The comparison is string equality after normalisation, so it is byte-for-byte
and case-sensitive in the path, query, and fragment. That is intentional: those
parts are server-defined and we have no basis for claiming two spellings are
equivalent.

## API

### `normalizeUrl(input)`

Returns the normalised URL string. Throws a `TypeError` if `input` is not a
string, and an `Error` if `input` is not a valid absolute URL.

### `urlsEqual(a, b)`

Returns `true` when `normalizeUrl(a) === normalizeUrl(b)`. Propagates the same
errors as `normalizeUrl`.

## Design notes

The window stores values eagerly rather than keeping running aggregates. Running
sums drift with floating point over long streams, and recomputing from a small
buffer is cheap enough that the drift is not worth the speed.

