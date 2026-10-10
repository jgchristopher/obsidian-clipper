import { afterEach, describe, expect, it, vi } from 'vitest';
import { ClipperType, newClipper } from './types';

describe('newClipper', () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it('stamps each clipper with the time it was created', () => {
		vi.useFakeTimers({ toFake: ['Date'] });
		vi.setSystemTime(new Date('2026-01-02T03:04:05Z'));
		const first = newClipper();
		vi.setSystemTime(new Date('2026-03-04T05:06:07Z'));
		const second = newClipper();
		expect(first.createdAt).toEqual(new Date('2026-01-02T03:04:05Z'));
		expect(second.createdAt).toEqual(new Date('2026-03-04T05:06:07Z'));
	});

	it('gives each clipper its own ID and its own nested settings', () => {
		const a = newClipper();
		const b = newClipper();
		expect(a.clipperId).toMatch(/^[0-9a-f-]{36}$/);
		expect(a.clipperId).not.toBe(b.clipperId);
		a.markdownSettings.h1 = '#';
		expect(b.markdownSettings.h1).toBe('##');
	});

	it('starts from the defaults and applies overrides', () => {
		const made = newClipper({ type: ClipperType.TOPIC, name: 'Reading' });
		expect(made).toMatchObject({
			type: 'topic',
			name: 'Reading',
			headingLevel: 1,
			position: 'append',
		});
	});
});
