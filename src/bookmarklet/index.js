//@ts-ignore
(function (vault, note) {
    var vaultName = encodeURIComponent(vault);
    var notePath = encodeURIComponent(note);
    function getSelectionHtml() {
        var html = '';
        if (typeof window.getSelection != 'undefined') {
            var sel = window.getSelection();
            if (sel && sel.rangeCount) {
                var container = document.createElement('div');
                for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                    container.appendChild(sel.getRangeAt(i).cloneContents());
                }
                html = container.innerHTML;
            }
        }
        return html;
    }
    function sendToObsidian(url, title, content) {
        var obsidianUrl = "obsidian://obsidian-clipper?vault=".concat(vaultName, "&notePath=").concat(notePath, "&url=").concat(encodeURIComponent(url), "&title=").concat(encodeURIComponent(title), "&format=html&highlightdata=").concat(encodeURIComponent(content));
        document.location.href = obsidianUrl;
    }
    sendToObsidian(document.URL, document.title, getSelectionHtml());
})('~VaultNameFiller~', '~NotePath~');
