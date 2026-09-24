import { describe, expect, it } from 'vitest';
import { FakeApp } from '../../test/fakes/fakeapp';
import {
	applyTemplateTransformations,
	getTemplateContents,
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

	// Current behavior: a missing template silently yields an empty entry.
	it('returns an empty string when the template does not exist', async () => {
		expect(await getTemplateContents(new FakeApp().app, 'nope.md')).toBe('');
	});
});
