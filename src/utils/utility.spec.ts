import { describe, expect, it } from 'vitest';
import { Utility } from './utility';

describe('Utility.cleanHeading', () => {
	it('strips a single leading "# " from a literal markdown heading', () => {
		expect(Utility.cleanHeading('# Clippings')).toBe('Clippings');
	});

	it('leaves plain heading text unchanged', () => {
		expect(Utility.cleanHeading('Clippings')).toBe('Clippings');
	});

	// Current behavior: only a level-1 prefix is recognized.
	it('does not strip multi-level prefixes like "## "', () => {
		expect(Utility.cleanHeading('## Clippings')).toBe('## Clippings');
	});

	it('does not strip a "#" without a following space (a tag)', () => {
		expect(Utility.cleanHeading('#tag')).toBe('#tag');
	});
});

describe('Utility.parseDomainFromUrl', () => {
	it('returns the full hostname including subdomains', () => {
		expect(Utility.parseDomainFromUrl('https://www.example.co.uk/a?b=c')).toBe(
			'www.example.co.uk'
		);
	});

	it('handles reserved hosts like localhost', () => {
		expect(Utility.parseDomainFromUrl('http://localhost:3000/page')).toBe(
			'localhost'
		);
	});
});

describe('Utility.assertNotNull', () => {
	it('passes through non-null values', () => {
		expect(() => Utility.assertNotNull('value')).not.toThrow();
		expect(() => Utility.assertNotNull({})).not.toThrow();
	});

	it('throws on null and undefined', () => {
		expect(() => Utility.assertNotNull(null)).toThrow('Value is null');
		expect(() => Utility.assertNotNull(undefined)).toThrow('Value is null');
	});

	// Current behavior: the check is truthiness, not nullishness.
	it('also throws on falsy non-null values', () => {
		expect(() => Utility.assertNotNull('')).toThrow('Value is null');
		expect(() => Utility.assertNotNull(0)).toThrow('Value is null');
	});
});
