import { describe, expect, it } from 'vitest';
import { FakeApp, notices, settle, tfile } from '../test/fakes/fakeapp';
import { clipper } from '../test/fakes/clippers';
import { ClippedData } from './clippeddata';
import { SectionPosition } from './settings/types';
import { TopicNoteEntry } from './topicnoteentry';

describe('TopicNoteEntry', () => {
	const entry = (fake: FakeApp) =>
		new ClippedData('Page', 'https://ex.com', clipper(), fake.app, 'body');

	it('appends the formatted entry under the configured heading', async () => {
		const fake = new FakeApp({ 'topics/rust.md': '# Clips\n- old\n# Notes' });
		await new TopicNoteEntry(
			fake.app,
			false,
			SectionPosition.APPEND,
			''
		).writeToNote(tfile('topics/rust.md'), entry(fake), 'Clips', 1);
		await settle();
		expect(fake.read('topics/rust.md')).toBe(
			'# Clips\n- old\n- [ ] [Page](https://ex.com) \nbody\n > \n\n---\n# Notes'
		);
	});

	it('prepends without a heading', async () => {
		const fake = new FakeApp({ 'n.md': '---\na: 1\n---\nold' });
		await new TopicNoteEntry(
			fake.app,
			false,
			SectionPosition.PREPEND,
			''
		).writeToNote(tfile('n.md'), entry(fake));
		await settle();
		expect(fake.read('n.md')).toBe(
			'---\na: 1\n---\n- [ ] [Page](https://ex.com) \nbody\n > \n\n---\nold'
		);
	});

	it('applies the entry template', async () => {
		const fake = new FakeApp({ 'n.md': 'old', 't.md': '* {{title}}' });
		await new TopicNoteEntry(
			fake.app,
			false,
			SectionPosition.APPEND,
			't.md'
		).writeToNote(tfile('n.md'), entry(fake));
		await settle();
		expect(fake.read('n.md')).toBe('old\n* Page');
	});

	it('shows a notice when the note no longer exists', async () => {
		const fake = new FakeApp();
		await new TopicNoteEntry(
			fake.app,
			false,
			SectionPosition.APPEND,
			''
		).writeToNote(tfile('gone.md'), entry(fake));
		await settle();
		expect(notices).toContain(
			"Obsidian Clipper couldn't find the note to append to"
		);
	});

	it('throws when given no file', async () => {
		const fake = new FakeApp();
		await expect(
			new TopicNoteEntry(
				fake.app,
				false,
				SectionPosition.APPEND,
				''
			).writeToNote(null, entry(fake))
		).rejects.toThrow('Value is null');
	});
});
