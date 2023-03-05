//@ts-ignore
((vault: string, note: string) => {
	const vaultName = encodeURIComponent(vault);
	const notePath = encodeURIComponent(note);
	function getSelectionHtml(): string {
		let html = '';
		if (typeof window.getSelection != 'undefined') {
			const sel = window.getSelection();
			if (sel && sel.rangeCount) {
				const container = document.createElement('div');
				for (let i = 0, len = sel.rangeCount; i < len; ++i) {
					container.appendChild(sel.getRangeAt(i).cloneContents());
				}
				html = container.innerHTML;
			}
		}
		return html;
	}

	function sendToObsidian(url: string, title: string, content: string): void {
		const obsidianUrl = `obsidian://obsidian-clipper?vault=${vaultName}&notePath=${notePath}&url=${encodeURIComponent(
			url
		)}&title=${encodeURIComponent(
			title
		)}&format=html&highlightdata=${encodeURIComponent(content)}`;

		document.location.href = obsidianUrl;
	}

	sendToObsidian(document.URL, document.title, getSelectionHtml());
})('~VaultNameFiller~', '~NotePath~');
