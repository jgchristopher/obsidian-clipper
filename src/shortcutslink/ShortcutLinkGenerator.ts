export class ShortcutLinkGenerator {
	clipperId: string;
	vaultName: string;

	constructor(clipperId: string, vaultName: string) {
		(this.clipperId = clipperId), (this.vaultName = vaultName);
	}

	public generateShortcutLink(): string {
		return `obsidian://obsidian-clipper?clipperId=${encodeURIComponent(
			this.clipperId
		)}&vault=${encodeURIComponent(
			this.vaultName
		)}&title=<<replace title>>&highlightdata=<<replace content>>`;
	}
}
