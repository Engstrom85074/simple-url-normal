import { test } from 'node:test';
import assert from 'node:assert/strict';

import { normalizeUrl, urlsEqual } from '../src/index.js';

test('lowercases scheme and host', () => {
  assert.equal(normalizeUrl('HTTP://EXAMPLE.COM/'), 'http://example.com/');
});

test('drops the default port for the scheme', () => {
  assert.equal(normalizeUrl('http://example.com:80/a'), 'http://example.com/a');
  assert.equal(normalizeUrl('https://example.com:443/a'), 'https://example.com/a');
});

test('keeps a non-default port', () => {
  assert.equal(normalizeUrl('http://example.com:8080/a'), 'http://example.com:8080/a');
});

test('removes a single trailing slash from a non-root path', () => {
  assert.equal(normalizeUrl('http://example.com/a/'), 'http://example.com/a');
});

test('keeps the root path as a single slash', () => {
  assert.equal(normalizeUrl('http://example.com/'), 'http://example.com/');
  assert.equal(normalizeUrl('http://example.com'), 'http://example.com/');
});

test('preserves query and fragment', () => {
  assert.equal(
    normalizeUrl('http://example.com/a?b=1&c=2#frag'),
    'http://example.com/a?b=1&c=2#frag'
  );
});

test('does not reorder query parameters', () => {
  assert.notEqual(
    normalizeUrl('http://example.com/?a=1&b=2'),
    normalizeUrl('http://example.com/?b=2&a=1')
  );
});

test('urlsEqual returns true for equivalent URLs', () => {
  assert.equal(urlsEqual('HTTP://Example.COM:80/a/', 'http://example.com/a'), true);
});

test('urlsEqual returns false for different URLs', () => {
  assert.equal(urlsEqual('http://example.com/a', 'http://example.com/b'), false);
});

test('throws a TypeError for non-string input', () => {
  assert.throws(() => normalizeUrl(42), TypeError);
});

test('throws an Error for an invalid URL', () => {
  assert.throws(() => normalizeUrl('not a url'), /invalid URL/);
});

test('is idempotent', () => {
  const once = normalizeUrl('HTTP://EXAMPLE.COM:80/a/');
  assert.equal(normalizeUrl(once), once);
});
