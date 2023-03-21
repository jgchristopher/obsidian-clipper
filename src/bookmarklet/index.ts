//@ts-ignore
//import MicroModal from 'micromodal';

((vault: string, note: string, includeComment: string) => {
	//This is stupid but webpack was removing the includeComment when it was a boolean
	const useComments = encodeURIComponent(includeComment);
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

	function getCommentPrompt(url: string, title: string, content: string): void {
		let comment = window.prompt('Add you comment...');
		if (comment) {
			comment = encodeURIComponent(comment);
		}
		const obsidianUrl = `obsidian://obsidian-clipper?vault=${vaultName}&notePath=${notePath}&url=${encodeURIComponent(
			url
		)}&title=${encodeURIComponent(
			title
		)}&format=html&highlightdata=${encodeURIComponent(
			content
		)}&comment=${comment}`;
		console.log(comment);
		document.location.href = obsidianUrl;
	}

	/**
  function getComment(url: string, title: string, content: string): void {
    const modalHtml = `
<div
  style="font-family: -apple-system, BlinkMacSystemFont, avenir next, avenir,
      helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial,
      sans-serif;"
  class="modal micromodal-slide"
>
  <div
    style="position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.75);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;"
    class="modal__overlay"
    tabindex="-1"
    data-micromodal-close
  >
    <div
      style="background-color: #fff;
    padding: 30px;
    max-width: 740px;
    width: 50%;
    border-radius: 4px;
    overflow-y: auto;
    box-sizing: border-box;"
      class="modal__container"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-1-title"
    >
      <header
        style="display: flex;
    justify-content: space-between;
    align-items: center;"
        class="modal__header"
      >
        <h2
          style="margin-top: 0;
    margin-bottom: 0;
    font-weight: 600;
    font-size: 1.25rem;
    line-height: 1.25;
    color: #00449e;
    box-sizing: border-box;"
          class="modal__title"
        >
          Micromodal
        </h2>
        <button
          style="position: absolute;
    top: 20px;
    right: 20px;
    background: transparent;
    border: 0;
    cursor: pointer;
    margin: 0px;
    padding: 0px;
          position: static;
          font-size: 24px;
          "
          class="modal__close"
          aria-label="Close modal"
          data-micromodal-close
        />
      </header>
      <div class="modal-content-content">
        <div
          style="margin-top: 10px;
    margin-bottom: 10px;
        margin-top: 2rem;
    margin-bottom: 2rem;
    line-height: 1.5;
    color: rgba(0, 0, 0, 0.8);
 "
          class="modal__content"
        >
        <textarea id="obisidian-clipper-modal-comment" style="width: 100%;" placeholder="Add your comment..."></textarea>
        </div>
        <footer class="modal__footer">
          <button
            id="obisidian-clipper-modal-close"
            style="font-size: 0.875rem;
    padding-left: 1rem;
    padding-right: 1rem;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    background-color: #e6e6e6;
    color: rgba(0, 0, 0, 0.8);
    border-radius: 0.25rem;
    border-style: none;
    border-width: 0;
    cursor: pointer;
    -webkit-appearance: button;
    text-transform: none;
    overflow: visible;
    line-height: 1.15;
    margin: 0;
    will-change: transform;
    -moz-osx-font-smoothing: grayscale;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    transition: -webkit-transform 0.25s ease-out;
    transition: transform 0.25s ease-out;
    transition: transform 0.25s ease-out, -webkit-transform 0.25s ease-out;
            padding: 10px 15px;
    background-color: #e6e6e6;
    border-radius: 4px;
    -webkit-appearance: none;"
            class="modal__btn"
            data-micromodal-close
            aria-label="Close this dialog window">Close</button
          >
        </footer>
      </div>
    </div>
  </div>
</div>
`;
    const modal = document.createElement('div');
    modal.id = 'obsidian-clipper-modal-1';
    modal.ariaHidden = 'true';
    modal.style.zIndex = '10000';
    modal.innerHTML = modalHtml;

    document.body.appendChild(modal);
    const closeButton = document.getElementById(
      'obisidian-clipper-modal-close'
    );
    const textarea = document.getElementById(
      'obisidian-clipper-modal-comment'
    ) as HTMLFormElement;

    if (!closeButton) return;
    closeButton.addEventListener('click', function () {
      if (textarea != null) {
        console.log(textarea.value);
        const obsidianUrl = `obsidian://obsidian-clipper?vault=${vaultName}&notePath=${notePath}&url=${encodeURIComponent(
          url
        )}&title=${encodeURIComponent(
          title
        )}&format=html&highlightdata=${encodeURIComponent(
          content
        )}&comment=${encodeURIComponent(textarea.value)}`;
        console.log(textarea.value);
        document.location.href = obsidianUrl;
      }
      modal.style.display = 'none';
      modal.remove();
    });
    MicroModal.init();
    MicroModal.show('obsidian-clipper-modal-1');
  }
  **/

	function sendToObsidian(url: string, title: string, content: string): void {
		if (useComments === 'true') {
			getCommentPrompt(url, title, content);
		} else {
			const obsidianUrl = `obsidian://obsidian-clipper?vault=${vaultName}&notePath=${notePath}&url=${encodeURIComponent(
				url
			)}&title=${encodeURIComponent(
				title
			)}&format=html&highlightdata=${encodeURIComponent(content)}`;
			document.location.href = obsidianUrl;
		}
	}

	sendToObsidian(document.URL, document.title, getSelectionHtml());
})('~VaultNameFiller~', '~NotePath~', '~WithComment~');
