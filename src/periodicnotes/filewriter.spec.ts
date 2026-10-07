import { describe, expect, it } from 'vitest';
import { FakeApp, notices, tfile } from '../../test/fakes/fakeapp';
import { AppendWriter } from './appendwriter';
import { PrependWriter } from './prependwriter';

const NOTE = 'note.md';

async function write(
	Writer: typeof AppendWriter | typeof PrependWriter,
	content: string,
	clip: string,
	heading?: string,
	headingLevel?: number
) {
	const fake = new FakeApp({ [NOTE]: content });
	await new Writer(fake.app, false).write(
		tfile(NOTE),
		clip,
		heading,
		headingLevel
	);
	return fake.read(NOTE);
}

const lines = (...l: string[]) => l.join('\n');

describe('AppendWriter without a heading', () => {
	it('appends the clipping on a new line at the end of the file', async () => {
		expect(await write(AppendWriter, lines('a', 'b'), 'CLIP')).toBe(
			lines('a', 'b', 'CLIP')
		);
	});

	it('appends at the end of a note with frontmatter', async () => {
		const doc = lines('---', 'tags: x', '---', 'body');
		expect(await write(AppendWriter, doc, 'CLIP')).toBe(
			lines('---', 'tags: x', '---', 'body', 'CLIP')
		);
	});
});

describe('PrependWriter without a heading', () => {
	it('inserts directly after frontmatter', async () => {
		const doc = lines('---', 'tags: x', '---', 'body');
		expect(await write(PrependWriter, doc, 'CLIP')).toBe(
			lines('---', 'tags: x', '---', 'CLIP', 'body')
		);
	});

	it('inserts at the top when there is no frontmatter', async () => {
		expect(await write(PrependWriter, lines('first', 'second'), 'CLIP')).toBe(
			lines('CLIP', 'first', 'second')
		);
	});

	it('inserts after frontmatter that is the whole note', async () => {
		const doc = lines('---', 'tags: x', '---');
		expect(await write(PrependWriter, doc, 'CLIP')).toBe(
			lines('---', 'tags: x', '---', 'CLIP')
		);
	});
});

describe('AppendWriter under a heading', () => {
	it('appends to the end of a middle section', async () => {
		const doc = lines('# A', '- a1', '# Clips', '- c1', '# B', '- b1');
		expect(await write(AppendWriter, doc, 'CLIP', 'Clips', 1)).toBe(
			lines('# A', '- a1', '# Clips', '- c1', 'CLIP', '# B', '- b1')
		);
	});

	it('appends to the end of the file when the section is last', async () => {
		const doc = lines('# A', '- a1', '# Clips', '- c1');
		expect(await write(AppendWriter, doc, 'CLIP', 'Clips', 1)).toBe(
			lines('# A', '- a1', '# Clips', '- c1', 'CLIP')
		);
	});

	it('accepts a heading given as literal markdown ("# Clips")', async () => {
		const doc = lines('# Clips', '- c1');
		expect(await write(AppendWriter, doc, 'CLIP', '# Clips', 1)).toBe(
			lines('# Clips', '- c1', 'CLIP')
		);
	});

	it('keeps blank lines and appends after the last non-blank line', async () => {
		const doc = lines('# Clips', '', '- c1', '', '# B', 'b');
		expect(await write(AppendWriter, doc, 'CLIP', 'Clips', 1)).toBe(
			lines('# Clips', '', '- c1', 'CLIP', '', '# B', 'b')
		);
	});

	it('keeps the trailing newline when the section is last', async () => {
		const doc = lines('# Clips', '- c1', '');
		expect(await write(AppendWriter, doc, 'CLIP', 'Clips', 1)).toBe(
			lines('# Clips', '- c1', 'CLIP', '')
		);
	});

	it('appends directly under the heading when the section is empty', async () => {
		const doc = lines('# Clips', '', '# B');
		expect(await write(AppendWriter, doc, 'CLIP', 'Clips', 1)).toBe(
			lines('# Clips', 'CLIP', '', '# B')
		);
	});

	it('ends the section at a shallower heading', async () => {
		const doc = lines('## Clips', '- c1', '# Other', 'o');
		expect(await write(AppendWriter, doc, 'CLIP', 'Clips', 2)).toBe(
			lines('## Clips', '- c1', 'CLIP', '# Other', 'o')
		);
	});

	it('keeps deeper sub-headings inside the section', async () => {
		const doc = lines('## Clips', '### Sub', '- s1', '## Next', 'n');
		expect(await write(AppendWriter, doc, 'CLIP', 'Clips', 2)).toBe(
			lines('## Clips', '### Sub', '- s1', 'CLIP', '## Next', 'n')
		);
	});

	it('creates a missing heading at the end of a note with frontmatter', async () => {
		const doc = lines('---', 'a: 1', '---', 'body');
		expect(await write(AppendWriter, doc, 'CLIP', 'Clips', 1)).toBe(
			lines('---', 'a: 1', '---', 'body', '# Clips ', '', ' CLIP')
		);
	});

	it('creates the heading at the end of the file when it is missing', async () => {
		expect(
			await write(AppendWriter, lines('# Other', 'x'), 'CLIP', 'Clips', 2)
		).toBe(lines('# Other', 'x', '## Clips ', '', ' CLIP'));
		expect(notices).toContain("Can't find heading");
	});

	// Intended: the configured level is strict. A same-named heading at a
	// different level counts as missing, so a second heading is created.
	it('treats a heading at a different level as missing', async () => {
		expect(
			await write(AppendWriter, lines('# Clips', 'x'), 'CLIP', 'Clips', 2)
		).toBe(lines('# Clips', 'x', '## Clips ', '', ' CLIP'));
	});
});

describe('PrependWriter under a heading', () => {
	it('keeps blank lines in the section', async () => {
		const doc = lines('# Clips', '', '- c1', '', '# B');
		expect(await write(PrependWriter, doc, 'CLIP', 'Clips', 1)).toBe(
			lines('# Clips', 'CLIP', '', '- c1', '', '# B')
		);
	});

	it('ends the section at a shallower heading', async () => {
		const doc = lines('## Clips', '- c1', '# Other', 'o');
		expect(await write(PrependWriter, doc, 'CLIP', 'Clips', 2)).toBe(
			lines('## Clips', 'CLIP', '- c1', '# Other', 'o')
		);
	});

	it('inserts directly after the heading line', async () => {
		const doc = lines('# A', '# Clips', '- c1', '# B');
		expect(await write(PrependWriter, doc, 'CLIP', 'Clips', 1)).toBe(
			lines('# A', '# Clips', 'CLIP', '- c1', '# B')
		);
	});

	it('creates a missing heading at the top when there is no frontmatter', async () => {
		const doc = lines('first', 'second');
		expect(await write(PrependWriter, doc, 'CLIP', 'Clips', 1)).toBe(
			lines('# Clips ', '', ' CLIP', 'first', 'second')
		);
	});

	it('creates a missing heading after the frontmatter', async () => {
		const doc = lines('---', 'a: 1', '---', 'body');
		expect(await write(PrependWriter, doc, 'CLIP', 'Clips', 1)).toBe(
			lines('---', 'a: 1', '---', '# Clips ', '', ' CLIP', 'body')
		);
	});
});

describe('opening the note after writing', () => {
	it('opens the note when it is not already open', async () => {
		const fake = new FakeApp({ [NOTE]: 'x' });
		await new AppendWriter(fake.app, true).write(tfile(NOTE), 'CLIP');
		expect(fake.opened).toEqual([NOTE]);
		expect(fake.activated).toEqual([]);
	});

	it('focuses the existing leaf when the note is already open', async () => {
		const fake = new FakeApp({ [NOTE]: 'x' });
		fake.openLeaves.push({ view: { file: { path: NOTE } } });
		await new AppendWriter(fake.app, true).write(tfile(NOTE), 'CLIP');
		expect(fake.activated).toEqual([NOTE]);
		expect(fake.opened).toEqual([]);
	});

	it('does not open anything when openOnWrite is off', async () => {
		const fake = new FakeApp({ [NOTE]: 'x' });
		await new AppendWriter(fake.app, false).write(tfile(NOTE), 'CLIP');
		expect(fake.opened).toEqual([]);
	});
});
