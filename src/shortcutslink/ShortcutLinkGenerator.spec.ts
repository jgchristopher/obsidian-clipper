import { describe, expect, it } from 'vitest';
import { clipper } from '../../test/fakes/clippers';
import { ShortcutLinkGenerator } from './ShortcutLinkGenerator';

describe('ShortcutLinkGenerator', () => {
	it('builds an obsidian:// link with placeholders for the Shortcut to fill', () => {
		const link = new ShortcutLinkGenerator(
			clipper({ clipperId: 'abc-123', vaultName: 'My Vault' })
		).generateShortcutLink();

		expect(link).toBe(
			'obsidian://obsidian-clipper?clipperId=abc-123&vault=My%20Vault&url=shortcut&title=<<replace title>>&highlightdata=<<replace content>>'
		);
	});
});
