import { describe, expect, it } from 'vitest';
import { FakeApp, notices } from '../../test/fakes/fakeapp';
import {
	applyTemplateTransformations,
	getTemplateContents,
	missingTemplateNotice,
} from './templateutils';

describe('applyTemplateTransformations', () => {
	const apply = (template: string) =>
		applyTemplateTransformations(
			'Title',
			'https://example.com',
			'#a #b',
			'09:30',
			'01/02/24',
			'the content',
			'a comment',
			template
		);

	it('replaces every supported variable', () => {
		expect(
			apply(
				'{{title}}|{{url}}|{{tags}}|{{time}}|{{date}}|{{content}}|{{comment}}'
			)
		).toBe(
			'Title|https://example.com|#a #b|09:30|01/02/24|the content|a comment'
		);
	});

	it('is case-insensitive and tolerates inner whitespace', () => {
		expect(apply('{{ TITLE }} {{Url}}')).toBe('Title https://example.com');
	});

	it('replaces repeated occurrences', () => {
		expect(apply('{{title}} and {{title}}')).toBe('Title and Title');
	});

	it('leaves unknown variables alone', () => {
		expect(apply('{{author}}')).toBe('{{author}}');
	});

	// String.replace reads $$, $&, $1 and $` in a replacement string as
	// patterns, which turned LaTeX $$x$$ into $x$.
	it('inserts $ sequences in every variable literally', () => {
		const dollars = '$$E=mc^2$$ $& $1 $`';
		expect(
			applyTemplateTransformations(
				`t ${dollars}`,
				`u ${dollars}`,
				`g ${dollars}`,
				`h ${dollars}`,
				`d ${dollars}`,
				`c ${dollars}`,
				`m ${dollars}`,
				'{{title}}|{{url}}|{{tags}}|{{time}}|{{date}}|{{content}}|{{comment}}'
			)
		).toBe(
			['t', 'u', 'g', 'h', 'd', 'c', 'm'].map((p) => `${p} ${dollars}`).join('|')
		);
	});

	// $' inserts the rest of the template, placeholders included, so each
	// later replacement copied the template again. One variable keeps the old
	// output small enough to fail instead of exhausting memory.
	it("inserts $' literally", () => {
		expect(
			applyTemplateTransformations('', '', '', '', '', "$'", '', '[{{content}}]')
		).toBe("[$']");
	});

	// Clipped text about templates can contain variables itself. Replacing
	// one variable at a time used to expand those on a later pass.
	it('leaves variables inside clipped values alone', () => {
		expect(
			applyTemplateTransformations(
				'How {{date}} works',
				'https://example.com/{{tags}}',
				'#a',
				'09:30',
				'01/02/24',
				'Write {{url}} or {{ title }}',
				'see {{content}}',
				'{{title}}|{{url}}|{{content}}|{{comment}}|{{date}}'
			)
		).toBe(
			'How {{date}} works|https://example.com/{{tags}}|Write {{url}} or {{ title }}|see {{content}}|01/02/24'
		);
	});

	it('defaults content and comment to empty strings', () => {
		expect(
			applyTemplateTransformations(
				't',
				'u',
				'',
				'',
				'',
				undefined,
				undefined,
				'[{{content}}][{{comment}}]'
			)
		).toBe('[][]');
	});
});

describe('getTemplateContents', () => {
	it('reads the template file from the vault', async () => {
		const fake = new FakeApp({ 'templates/entry.md': '- {{title}}' });
		expect(await getTemplateContents(fake.app, 'templates/entry.md')).toBe(
			'- {{title}}'
		);
	});

	it('resolves a path without the .md extension', async () => {
		const fake = new FakeApp({ 'templates/entry.md': '- {{title}}' });
		expect(await getTemplateContents(fake.app, 'templates/entry')).toBe(
			'- {{title}}'
		);
	});

	it('returns an empty string for "/"', async () => {
		expect(await getTemplateContents(new FakeApp().app, '/')).toBe('');
	});

	it('returns null and names the path in a notice when the template does not exist', async () => {
		expect(await getTemplateContents(new FakeApp().app, 'nope.md')).toBeNull();
		expect(notices).toEqual([missingTemplateNotice('nope.md')]);
		expect(notices[0]).toContain('nope.md');
	});
});
