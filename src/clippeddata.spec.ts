import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FakeApp, notices } from '../test/fakes/fakeapp';
import { clipper } from '../test/fakes/clippers';
import { ClippedData } from './clippeddata';
import { missingTemplateNotice } from './utils/templateutils';

describe('ClippedData.formattedEntry', () => {
	beforeEach(() => {
		vi.useFakeTimers({ toFake: ['Date'] });
		vi.setSystemTime(new Date(2024, 0, 2, 9, 30));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	const app = new FakeApp().app;

	it('formats a link-only task when there is no clipped content', async () => {
		const data = new ClippedData('Page', 'https://ex.com', clipper(), app);
		expect(await data.formattedEntry()).toBe(
			'- [ ] [Page](https://ex.com) \n\n---'
		);
	});

	it('formats a linked title followed by content and comment', async () => {
		const data = new ClippedData(
			'Page',
			'https://ex.com',
			clipper(),
			app,
			'> quoted',
			'my note'
		);
		expect(await data.formattedEntry()).toBe(
			'- [ ] [Page](https://ex.com) \n> quoted\n >my note \n\n---'
		);
	});

	it('omits the title link in advanced storage mode', async () => {
		const data = new ClippedData(
			'Page',
			'https://ex.com',
			clipper({ advancedStorage: true }),
			app,
			'![[clippings/ex.com#x|clipped]]'
		);
		expect(await data.formattedEntry()).toBe(
			'- [ ] Page \n![[clippings/ex.com#x|clipped]]\n > \n\n---'
		);
	});

	it('turns comma-separated tags into hashtags and strips spaces', async () => {
		const data = new ClippedData(
			'Page',
			'https://ex.com',
			clipper({ tags: 'reading, to do' }),
			app
		);
		expect(await data.formattedEntry()).toBe(
			'- [ ] [Page](https://ex.com) #reading #todo\n\n---'
		);
	});

	it('renders through the entry template when one is set', async () => {
		const fake = new FakeApp({
			'templates/entry.md':
				'{{date}} {{time}} [{{title}}]({{url}}) {{tags}}\n{{content}}',
		});
		const data = new ClippedData(
			'Page',
			'https://ex.com',
			clipper({
				tags: 'web',
				dateFormat: 'YYYY-MM-DD',
				timestampFormat: 'HH:mm',
			}),
			fake.app,
			'body'
		);
		expect(await data.formattedEntry('templates/entry.md')).toBe(
			'2024-01-02 09:30 [Page](https://ex.com) #web\nbody'
		);
	});

	it('ignores an empty template path', async () => {
		const data = new ClippedData('Page', 'https://ex.com', clipper(), app);
		expect(await data.formattedEntry('')).toBe(
			'- [ ] [Page](https://ex.com) \n\n---'
		);
	});

	it('falls back to the default format when the template is missing', async () => {
		const data = new ClippedData(
			'Page',
			'https://ex.com',
			clipper(),
			app,
			'body',
			'note'
		);
		expect(await data.formattedEntry('templates/gone.md')).toBe(
			'- [ ] [Page](https://ex.com) \nbody\n >note \n\n---'
		);
		expect(notices).toEqual([missingTemplateNotice('templates/gone.md')]);
	});

	it('exposes the url and raw content', () => {
		const data = new ClippedData('P', 'https://ex.com', clipper(), app, 'body');
		expect(data.getUrl()).toBe('https://ex.com');
		expect(data.getEntryContent()).toBe('body');
		expect(
			new ClippedData('P', 'u', clipper(), app).getEntryContent()
		).toBeUndefined();
	});
});
