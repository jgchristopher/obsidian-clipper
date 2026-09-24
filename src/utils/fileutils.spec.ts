import { describe, expect, it } from 'vitest';
import type { HeadingCache } from 'obsidian';
import { computeMetadata } from '../../test/fakes/fakeapp';
import { findStartAndAppendFromHeadingInCache, getFileName } from './fileutils';

function headingsOf(content: string): HeadingCache[] {
	return (computeMetadata(content).headings ?? []) as HeadingCache[];
}

describe('getFileName', () => {
	it('returns the last path segment', () => {
		expect(getFileName('this/is/a/path.md')).toBe('path.md');
	});

	it('returns the input when there is no slash', () => {
		expect(getFileName('mynote.md')).toBe('mynote.md');
	});
});

describe('findStartAndAppendFromHeadingInCache', () => {
	const doc = [
		'# Intro', // 0
		'text', // 1
		'## Clippings', // 2
		'- one', // 3
		'### Nested', // 4
		'- two', // 5
		'## Later', // 6
		'end', // 7
	].join('\n');

	it('starts on the line after the heading and ends at the next same-level heading', () => {
		expect(
			findStartAndAppendFromHeadingInCache('Clippings', 2, headingsOf(doc))
		).toEqual({ firstLine: 3, lastLine: 6 });
	});

	it('treats deeper headings as part of the section', () => {
		const result = findStartAndAppendFromHeadingInCache(
			'Clippings',
			2,
			headingsOf(doc)
		);
		expect(result.lastLine).not.toBe(4);
	});

	it('returns lastLine -1 when the heading is the last section', () => {
		expect(
			findStartAndAppendFromHeadingInCache('Later', 2, headingsOf(doc))
		).toEqual({ firstLine: 7, lastLine: -1 });
	});

	// Current behavior: only a heading of the *same* level ends the section.
	// A shallower heading (# after ##) does not.
	it('does not end the section at a shallower heading', () => {
		const shallower = ['## Clippings', '- one', '# Top', 'text'].join('\n');
		expect(
			findStartAndAppendFromHeadingInCache(
				'Clippings',
				2,
				headingsOf(shallower)
			)
		).toEqual({ firstLine: 1, lastLine: -1 });
	});

	it('requires the heading level to match', () => {
		expect(() =>
			findStartAndAppendFromHeadingInCache('Clippings', 1, headingsOf(doc))
		).toThrow('Heading not found');
	});

	it('throws when the heading does not exist', () => {
		expect(() =>
			findStartAndAppendFromHeadingInCache('Missing', 2, headingsOf(doc))
		).toThrow('Heading not found');
	});
});
