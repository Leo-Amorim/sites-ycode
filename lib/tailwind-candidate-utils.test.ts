import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractSafeTailwindCandidates, isSafeTailwindCandidate } from '@/lib/tailwind-candidate-utils';

test('accepts ordinary utilities, variants and arbitrary values', () => {
  for (const token of [
    'flex',
    'text-[60px]',
    'max-lg:grid-cols-1',
    'hover:bg-[#b4ea62]',
    'bg-[image:var(--bg-img)]',
    'bg-[url(\'https://example.com/a%20b.png\')]',
    'shadow-[0px_1px_0px_0px_rgba(0,0,0,0.1)]',
    'text-[color:var(--578837ce-8046-4df6-b3e4-db51b3af33cd)]',
    'bg-[#000000]/5',
  ]) {
    assert.equal(isSafeTailwindCandidate(token), true, token);
  }
});

test('rejects candidates that would emit an unclosed bracket', () => {
  // The exact tokens that truncated production stylesheets.
  assert.equal(isSafeTailwindCandidate('ml-[12 mr-[12 rem] pb-[0rem] pt-[1rem]'), false);
  assert.equal(isSafeTailwindCandidate('ml-[12'), false);
  assert.equal(isSafeTailwindCandidate('rem]'), false);
  assert.equal(isSafeTailwindCandidate('shadow-[0px_4px_10px_0px_rgba(0_0]'), false);
  assert.equal(isSafeTailwindCandidate('bg-[rgba(0,0,0,0.5]'), false);
});

test('rejects whitespace, quotes and block terminators', () => {
  assert.equal(isSafeTailwindCandidate(''), false);
  assert.equal(isSafeTailwindCandidate('text-[60 px]'), false);
  assert.equal(isSafeTailwindCandidate('bg-[url(\'a)]'), false);
  assert.equal(isSafeTailwindCandidate('content-["x]'), false);
  assert.equal(isSafeTailwindCandidate('text-[red;]'), false);
  assert.equal(isSafeTailwindCandidate('text-[red}]'), false);
});

test('extractSafeTailwindCandidates splits on whitespace and drops bad tokens', () => {
  assert.deepEqual(
    extractSafeTailwindCandidates('  flex  pb-0 ml-[12 mr-[12 rem] pb-[0rem] pt-[1rem] text-[60px]'),
    ['flex', 'pb-0', 'pb-[0rem]', 'pt-[1rem]', 'text-[60px]'],
  );
  assert.deepEqual(extractSafeTailwindCandidates(''), []);
});
