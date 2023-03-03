//@ts-ignore
((vault: string) => {
  const vaultName = encodeURIComponent(vault);

  function getSelectionHtml(): string {
    let html = '';
    if (typeof window.getSelection != 'undefined') {
      let sel = window.getSelection();
      if (sel && sel.rangeCount) {
        let container = document.createElement('div');
        for (let i = 0, len = sel.rangeCount; i < len; ++i) {
          container.appendChild(sel.getRangeAt(i).cloneContents());
        }
        html = container.innerHTML;
      }
    }
    return html;
  }

  function sendToObsidian(url: string, title: string, content: string): void {
    const obsidianUrl = `obsidian://obsidian-clipper?vault=${vaultName}&url=${encodeURIComponent(
      url
    )}&title=${encodeURIComponent(
      title
    )}&format=html&highlightdata=${encodeURIComponent(content)}`;

    document.location.href = obsidianUrl;
  }

  sendToObsidian(document.URL, document.title, getSelectionHtml());
})('~VaultNameFiller~');
