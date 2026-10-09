// @vitest-environment-options {"url": "https://example.com/articles/1"}
/**
 * Runs the shipped bookmarklet (the javascript: URL produced by the generated
 * BookmarketlGenerator, after tsc, webpack, and minification) against a DOM
 * selection, and captures the obsidian:// URL it navigates to. Run
 * `pnpm build` first.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BookmarketlGenerator } from '../src/bookmarkletlink/bookmarkletgenerator';

type RunOptions = {
	html: string;
	select?: string; // CSS selector of the element to select; defaults to body
	clipperId?: string;
	vault?: string;
	headingLevel?: number;
	captureComments?: boolean;
	title?: string;
	userAgent?: string;
};

type Run = {
	navigatedTo: string | undefined;
	params: URLSearchParams;
	alert: ReturnType<typeof vi.fn>;
	proxies: { document: Document; navigator: Navigator };
	code: string;
};

function bookmarkletCode(opts: RunOptions): string {
	const link = new BookmarketlGenerator(
		opts.clipperId ?? 'cid-1',
		opts.vault ?? 'TestVault',
		'',
		opts.headingLevel ?? 1,
		String(opts.captureComments ?? false)
	).generateBookmarklet();
	expect(link.startsWith('javascript:')).toBe(true);
	return decodeURIComponent(link.slice('javascript:'.length));
}

function select(selector?: string) {
	const range = document.createRange();
	const target = selector ? document.querySelector(selector) : document.body;
	if (!target) throw new Error(`Nothing matches ${selector}`);
	range.selectNodeContents(target);
	const selection = window.getSelection();
	selection?.removeAllRanges();
	selection?.addRange(range);
}

/**
 * The bookmarklet reads globals `document`, `window`, `navigator`, and
 * `alert`. jsdom cannot navigate to obsidian:// URLs, so run the code with a
 * document whose `location.href` setter records the target instead.
 */
function execute(code: string, userAgent?: string) {
	const run = { navigatedTo: undefined as string | undefined };
	const location = {
		set href(value: string) {
			run.navigatedTo = value;
		},
		get href() {
			return document.URL;
		},
	};
	const documentProxy = new Proxy(document, {
		get(target, prop) {
			if (prop === 'location') return location;
			const value = Reflect.get(target, prop, target);
			return typeof value === 'function' ? value.bind(target) : value;
		},
	});
	const navigatorProxy = new Proxy(navigator, {
		get(target, prop) {
			if (prop === 'userAgent' && userAgent) return userAgent;
			const value = Reflect.get(target, prop, target);
			return typeof value === 'function' ? value.bind(target) : value;
		},
	});
	const alert = vi.fn();
	new Function('document', 'window', 'navigator', 'alert', code)(
		documentProxy,
		window,
		navigatorProxy,
		alert
	);
	return {
		run,
		alert,
		proxies: { document: documentProxy, navigator: navigatorProxy },
	};
}

function clip(opts: RunOptions): Run {
	document.head.innerHTML = '';
	document.body.innerHTML = opts.html;
	document.title = opts.title ?? 'A Page';
	select(opts.select);
	const code = bookmarkletCode(opts);
	const { run, alert, proxies } = execute(code, opts.userAgent);
	const query = run.navigatedTo?.split('?')[1] ?? '';
	return {
		navigatedTo: run.navigatedTo,
		params: new URLSearchParams(query),
		alert,
		proxies,
		code,
	};
}

afterEach(() => {
	window.getSelection()?.removeAllRanges();
	document.body.innerHTML = '';
});

describe('bookmarklet URL', () => {
	it('navigates to obsidian://obsidian-clipper with the clipper and page details', () => {
		const { navigatedTo, params } = clip({
			html: '<p>Hello <strong>world</strong></p>',
			clipperId: 'abc-123',
			vault: 'My Vault',
			title: 'Greeting & Stuff',
		});
		expect(navigatedTo?.startsWith('obsidian://obsidian-clipper?')).toBe(true);
		expect(Object.fromEntries(params)).toEqual({
			clipperId: 'abc-123',
			vault: 'My Vault',
			url: 'https://example.com/articles/1',
			title: 'Greeting & Stuff',
			highlightdata: 'Hello **world**',
			comments: '',
		});
	});

	it('sends an empty highlight when nothing is selected', () => {
		document.body.innerHTML = '<p>unselected</p>';
		window.getSelection()?.removeAllRanges();
		const { run } = execute(bookmarkletCode({ html: '' }));
		const params = new URLSearchParams(run.navigatedTo?.split('?')[1]);
		expect(params.get('highlightdata')).toBe('');
	});

	it('only converts the selected part of the page', () => {
		const { params } = clip({
			html: '<p id="a">first</p><p id="b">second</p>',
			select: '#b',
		});
		expect(params.get('highlightdata')).toBe('second');
	});

	it('carries vault names and clipper ids with quotes, backslashes, and percent signs exactly', () => {
		const vault = `My "Vault" it's C:\\notes\\ 100% & more`;
		const clipperId = `id"with'\\odd%20chars`;
		const { navigatedTo, params } = clip({
			html: '<p>x</p>',
			vault,
			clipperId,
		});
		expect(navigatedTo).toBeDefined();
		expect(params.get('vault')).toBe(vault);
		expect(params.get('clipperId')).toBe(clipperId);
		expect(params.get('highlightdata')).toBe('x');
	});

	it('percent-encodes spliced settings in the javascript: link', () => {
		const link = new BookmarketlGenerator(
			'cid',
			`a "b" 'c' \\d 5%`,
			'',
			1,
			'false'
		).generateBookmarklet();
		// Browsers percent-decode a javascript: URL before running it, so raw
		// quotes, spaces, backslashes, and bare % signs must not survive.
		const problems = link.match(/["\s\\]|%(?![0-9A-Fa-f]{2})/g);
		expect(problems).toBeNull();
	});
});

describe('markdown conversion', () => {
	const md = (html: string, headingLevel = 1) =>
		clip({ html, headingLevel }).params.get('highlightdata');

	it('shifts headings down by the configured heading level', () => {
		expect(md('<h1>One</h1><h2>Two</h2><h3>Three</h3><h4>Four</h4>', 1)).toBe(
			'## One \n\n### Two \n\n#### Three \n\n##### Four'
		);
		expect(md('<h1>One</h1>', 2)).toBe('### One');
	});

	it('shifts h5 and h6 by their own level', () => {
		expect(md('<h4>4</h4><h5>5</h5><h6>6</h6>', 0)).toBe(
			'#### 4 \n\n##### 5 \n\n###### 6'
		);
	});

	// Markdown has no heading deeper than ######, and Obsidian renders
	// ####### as plain text.
	it('caps shifted headings at level 6', () => {
		expect(md('<h5>5</h5><h6>6</h6>', 1)).toBe('###### 5 \n\n###### 6');
		expect(md('<h1>One</h1><h4>Four</h4>', 5)).toBe('###### One \n\n###### Four');
	});

	it('converts inline formatting, lists, code, and rules', () => {
		expect(
			md(
				[
					'<p><em>em</em> <strong>strong</strong> <code>code</code></p>',
					'<ul><li>one</li><li>two</li></ul>',
					'<ol><li>first</li></ol>',
					'<pre><code>let x = 1;</code></pre>',
					'<hr>',
					'<blockquote>quoted</blockquote>',
				].join('')
			)
		).toBe(
			[
				'*em* **strong** `code`',
				'',
				'-   one',
				'-   two',
				'',
				'1.  first',
				'',
				'```',
				'let x = 1;',
				'```',
				'',
				'---',
				'',
				'> quoted',
			].join('\n')
		);
	});

	it('makes links absolute', () => {
		expect(
			md('<a href="/other">rel</a> <a href="https://x.org/p">abs</a>')
		).toBe('[rel](https://example.com/other) [abs](https://x.org/p)');
	});

	it('converts a table with a header row to a markdown table', () => {
		expect(
			md(
				'<table><thead><tr><th>Name</th><th align="right">Qty</th></tr></thead>' +
					'<tbody><tr><td>apple</td><td>3</td></tr><tr><td>pear</td><td>10</td></tr></tbody></table>'
			)
		).toBe(
			[
				'| Name | Qty |',
				'| --- | ---: |',
				'| apple | 3   |',
				'| pear | 10  |',
			].join('\n')
		);
	});

	it('marks left, center, and right aligned columns in the divider', () => {
		expect(
			md(
				'<table><thead><tr><th align="left">L</th><th align="CENTER">C</th>' +
					'<th align="right">R</th><th>N</th></tr></thead>' +
					'<tbody><tr><td>a</td><td>b</td><td>c</td><td>d</td></tr></tbody></table>'
			)
		).toBe(
			[
				'| L   | C   | R   | N   |',
				'| :--- | :---: | ---: | --- |',
				'| a   | b   | c   | d   |',
			].join('\n')
		);
	});

	it('uses plain dividers for header cells missing from a short heading row', () => {
		expect(
			md(
				'<table><thead><tr><th align="right">A</th></tr></thead>' +
					'<tbody><tr><td>1</td><td>2</td></tr></tbody></table>'
			)
		).toBe(['| A   |', '| ---: | --- |', '| 1   | 2   |'].join('\n'));
	});

	it('adds an empty header to a table without one', () => {
		expect(
			md(
				'<table><tr><td>a</td><td>b</td></tr><tr><td>c</td><td>d</td></tr></table>'
			)
		).toBe(
			['|     |     |', '| --- | --- |', '| a   | b   |', '| c   | d   |'].join(
				'\n'
			)
		);
	});

	it('escapes pipes and keeps line breaks inside cells', () => {
		expect(
			md(
				'<table><thead><tr><th>A</th><th>B</th></tr></thead>' +
					'<tbody><tr><td>x | y</td><td>one<br>two</td></tr></tbody></table>'
			)
		).toBe(
			['| A   | B   |', '| --- | --- |', '| x \\| y | one  <br>two |'].join(
				'\n'
			)
		);
	});

	it('pads colspan cells', () => {
		expect(
			md(
				'<table><thead><tr><th>A</th><th>B</th></tr></thead>' +
					'<tbody><tr><td colspan="2">wide</td></tr></tbody></table>'
			)
		).toBe(['| A   | B   |', '| --- | --- |', '| wide |     |'].join('\n'));
	});

	it('renders a single-cell table as plain text', () => {
		expect(md('<table><tr><td>only</td></tr></table>')).toBe('only');
	});
});

describe('comment capture', () => {
	it('shows a comment modal instead of sending immediately', () => {
		const { navigatedTo } = clip({ html: '<p>x</p>', captureComments: true });
		expect(navigatedTo).toBeUndefined();
		expect(
			document.querySelector('.obsidian-clipper-modal-overlay')
		).not.toBeNull();
		expect(document.getElementById('obsidian-clipper-comment')).not.toBeNull();
	});

	it('sends the comment when the modal is submitted', () => {
		const { code } = clip({ html: '<p>x</p>', captureComments: true });
		// The Submit handler closes over the proxied document from the first
		// run, so capture navigation by re-running and clicking.
		document.body.innerHTML = '<p>body</p>';
		select();
		const { run } = execute(code);
		const textarea = document.getElementById(
			'obsidian-clipper-comment'
		) as HTMLTextAreaElement;
		textarea.value = 'my thoughts';
		document
			.querySelector<HTMLButtonElement>('.obsidian-clipper-modal button')
			?.click();

		const params = new URLSearchParams(run.navigatedTo?.split('?')[1]);
		expect(params.get('comments')).toBe('my thoughts');
		expect(params.get('highlightdata')).toBe('body');
		expect(textarea.value).toBe('');
		expect(
			document.querySelector<HTMLElement>('.obsidian-clipper-modal-overlay')
				?.style.display
		).toBe('none');
	});

	it('reuses the existing modal on a second click', () => {
		const { code } = clip({ html: '<p>x</p>', captureComments: true });
		execute(code);
		expect(
			document.querySelectorAll('.obsidian-clipper-modal-overlay')
		).toHaveLength(1);
	});
});

describe('Chrome on Windows URL limit', () => {
	const chromeWindows =
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

	it('does not navigate and alerts when the URL reaches 2000 characters', () => {
		const { navigatedTo, alert } = clip({
			html: `<p>${'word '.repeat(500)}</p>`,
			userAgent: chromeWindows,
		});
		expect(navigatedTo).toBeUndefined();
		expect(alert).toHaveBeenCalledTimes(1);
		expect(alert.mock.calls[0][0]).toMatch(/must be less than 2000/);
	});

	it('navigates normally for short selections', () => {
		const { navigatedTo, alert } = clip({
			html: '<p>short</p>',
			userAgent: chromeWindows,
		});
		expect(navigatedTo).toBeDefined();
		expect(alert).not.toHaveBeenCalled();
	});

	it('does not limit other browsers', () => {
		const { navigatedTo, alert } = clip({
			html: `<p>${'word '.repeat(500)}</p>`,
			userAgent:
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
		});
		expect(navigatedTo).toBeDefined();
		expect(alert).not.toHaveBeenCalled();
	});
});
