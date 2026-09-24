import moment from 'moment';
import { afterEach } from 'vitest';
import { modals, notices } from './mocks/obsidian';

// Obsidian exposes moment as a global; the plugin reads window.moment and
// globalThis.moment.
(globalThis as unknown as { moment: typeof moment }).moment = moment;

// Obsidian's DOM extensions.
(Node.prototype as unknown as { empty: () => void }).empty = function (
	this: Node
) {
	while (this.firstChild) this.removeChild(this.firstChild);
};
type CreateElOptions = { text?: string; cls?: string };
(
	HTMLElement.prototype as unknown as {
		createEl: (tag: string, o?: CreateElOptions) => HTMLElement;
	}
).createEl = function (this: HTMLElement, tag: string, o?: CreateElOptions) {
	const el = document.createElement(tag);
	if (o?.text) el.textContent = o.text;
	if (o?.cls) el.className = o.cls;
	this.appendChild(el);
	return el;
};
(globalThis as unknown as { createEl: (tag: string) => HTMLElement }).createEl =
	(tag: string) => document.createElement(tag);

afterEach(() => {
	notices.length = 0;
	modals.length = 0;
});
