import type { ObsidianClipperSettings } from 'src/settings/types';

export class ShortcutLinkGenerator {
	clipper: ObsidianClipperSettings;

	constructor(clipper: ObsidianClipperSettings) {
		this.clipper = clipper;
	}

	public generateShortcutLink(): string {
		return `obsidian://obsidian-clipper?clipperId=${encodeURIComponent(
			this.clipper.clipperId
		)}&vault=${encodeURIComponent(
			this.clipper.vaultName
		)}&url=${encodeURIComponent('shortcut')}&title=<<replace title>>&highlightdata=<<replace content>>`;
	}
}
