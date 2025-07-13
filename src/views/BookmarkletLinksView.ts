import { ItemView, WorkspaceLeaf } from 'obsidian';
import type { SvelteComponent } from 'svelte';
import LinksView from './LinksView.svelte';

export const VIEW_TYPE = 'Clipper';

export class BookmarkletLinksView extends ItemView {
	private view: SvelteComponent;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getIcon(): string {
		return 'paperclip';
	}

	getViewType() {
		return VIEW_TYPE;
	}

	getDisplayText() {
		return VIEW_TYPE;
	}

	async onOpen() {
		const container = this.containerEl.children[1];
		container.empty();

		this.view = new LinksView({
			target: container,
		});
	}

	async onClose() {
		this.view.$destroy();
	}
}
