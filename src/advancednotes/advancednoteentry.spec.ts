import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FakeApp } from '../../test/fakes/fakeapp';
import { AdvancedNoteEntry } from './advancednoteentry';

describe('AdvancedNoteEntry.writeToAdvancedNoteStorage', () => {
	beforeEach(() => {
		vi.useFakeTimers({ toFake: ['Date'] });
		vi.setSystemTime(new Date('2024-01-02T09:30:00.000Z'));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	const SECTION = '2024-01-02T09-30-00.000Z';

	it('creates a per-domain note and returns an embed of the new section', async () => {
		const fake = new FakeApp();
		fake.folders.add('clippings');
		const ref = await new AdvancedNoteEntry(
			fake.app,
			'clippings'
		).writeToAdvancedNoteStorage('ex.com', 'the text', 'https://ex.com/a');

		expect(ref).toBe(`![[clippings/ex.com#${SECTION}|clipped]]`);
		expect(fake.read('clippings/ex.com.md')).toBe(
			`\n# ${SECTION} \n the text\n[^1] \n\n [^1]: https://ex.com/a  \n`
		);
	});

	it('creates the storage folder when it is missing', async () => {
		const fake = new FakeApp();
		await new AdvancedNoteEntry(fake.app, 'clips').writeToAdvancedNoteStorage(
			'ex.com',
			'x',
			'https://ex.com'
		);
		expect(fake.folders.has('clips')).toBe(true);
		expect(fake.read('clips/ex.com.md')).toBeDefined();
	});

	it('appends to the existing domain note', async () => {
		const fake = new FakeApp({ 'clippings/ex.com.md': '# earlier \n old' });
		await new AdvancedNoteEntry(
			fake.app,
			'clippings'
		).writeToAdvancedNoteStorage('ex.com', 'new text', 'https://ex.com/b');
		expect(fake.read('clippings/ex.com.md')).toBe(
			`# earlier \n old\n\n# ${SECTION} \n new text\n[^1] \n\n [^1]: https://ex.com/b  \n`
		);
	});

	it('rejects when appending to the domain note fails', async () => {
		const fake = new FakeApp({ 'clippings/ex.com.md': 'old' });
		const app = fake.app;
		app.vault.modify = () => Promise.reject(new Error('disk full'));
		await expect(
			new AdvancedNoteEntry(app, 'clippings').writeToAdvancedNoteStorage(
				'ex.com',
				'x',
				'https://ex.com'
			)
		).rejects.toThrow('disk full');
	});

	it('rejects when the storage folder cannot be created', async () => {
		const fake = new FakeApp();
		const app = fake.app;
		app.vault.createFolder = () => Promise.reject(new Error('read-only'));
		await expect(
			new AdvancedNoteEntry(app, 'clips').writeToAdvancedNoteStorage(
				'ex.com',
				'x',
				'https://ex.com'
			)
		).rejects.toThrow('read-only');
		expect(fake.read('clips/ex.com.md')).toBeUndefined();
	});

	it('omits the source footnote for Apple Shortcut clips', async () => {
		const fake = new FakeApp();
		fake.folders.add('clippings');
		await new AdvancedNoteEntry(
			fake.app,
			'clippings'
		).writeToAdvancedNoteStorage('shortcut', 'x', 'shortcut');
		expect(fake.read('clippings/shortcut.md')).toBe(`\n# ${SECTION} \n x\n`);
	});
});
