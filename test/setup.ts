import moment from 'moment';
import { afterEach } from 'vitest';
import { notices } from './mocks/obsidian';

// Obsidian exposes moment as a global; the plugin reads window.moment and
// globalThis.moment.
(globalThis as unknown as { moment: typeof moment }).moment = moment;

// Obsidian's DOM extensions.
(Node.prototype as unknown as { empty: () => void }).empty = function (
	this: Node
) {
	while (this.firstChild) this.removeChild(this.firstChild);
};
(globalThis as unknown as { createEl: (tag: string) => HTMLElement }).createEl =
	(tag: string) => document.createElement(tag);

afterEach(() => {
	notices.length = 0;
});
