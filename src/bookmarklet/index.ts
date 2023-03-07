//@ts-ignore
import MicroModal from 'micromodal';

((vault: string, note: string, includeComment: boolean) => {
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
		//string {
		// Come back to this.
		const modal = document.createElement('div');
		modal.id = 'obsidian-clipper-modal-1';
		modal.ariaHidden = 'true';
		modal.style.zIndex = '10000';
		modal.innerHTML = modalHtml;
		// modal.style.width = '500px';
		// modal.style.height = '500px';
		// modal.style.position = 'absolute';
		// modal.style.margin = '0 auto';
		// modal.style.left = '50%';
		// modal.style.top = '50%';
		// modal.style.marginLeft = '-250px';
		// modal.style.marginRight = '-250px';
		// modal.style.zIndex = '1000';

		// const divWrapper = document.createElement('div');
		// divWrapper.style.backgroundColor = 'rgb(241 245 249)';
		//
		// modal.appendChild(divWrapper);
		//
		// const divHeader = document.createElement('div');
		// divHeader.style.paddingLeft = '1rem';
		// divHeader.style.paddingRight = '1rem';
		// divHeader.style.paddingTop = '1.25rem';
		// divHeader.style.paddingBottom = '1.25rem';
		// divHeader.style.backgroundColor = '#ffffff';
		// divHeader.style.borderBottomWidth = '1px';
		// divHeader.style.borderColor = '#e5e7eb';
		//
		// const divHeaderText = document.createElement('div');
		// divHeaderText.style.color = '#111827';
		// divHeaderText.style.fontSize = '1rem';
		// divHeaderText.style.lineHeight = '1.5rem';
		// divHeaderText.style.fontWeight = '600';
		// divHeaderText.textContent = 'Testing Testing Testing Dude!';
		//
		// divHeader.appendChild(divHeaderText);
		// divWrapper.appendChild(divHeader);
		//
		// const divTextAreaWrapper = document.createElement('div');
		// divTextAreaWrapper.style.padding = '0.125rem';
		// divTextAreaWrapper.style.margin = '-0.125rem';
		// divTextAreaWrapper.style.borderRadius = '0.5rem';
		//
		// const textarea = document.createElement('textarea');
		// textarea.rows = 5;
		// textarea.placeholder = 'Add your comment...';
		// textarea.style.display = 'block';
		// textarea.style.color = '#111827';
		// textarea.style.width = '100%';
		// textarea.style.borderRadius = '0.375rem';
		// textarea.style.borderWidth = '0';
		// textarea.style.boxShadow =
		// 	'var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color); --tw-ring-inset: inset; --ring-color: #4f46e5;';
		// textarea.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
		//
		// divTextAreaWrapper.appendChild(textarea);
		// divWrapper.appendChild(divTextAreaWrapper);
		//
		// const divButtonWrapper = document.createElement('div');
		// divButtonWrapper.style.display = 'flex';
		// divButtonWrapper.style.marginTop = '0.5rem';
		// divButtonWrapper.style.justifyContent = 'flex-end';
		//
		// const button = document.createElement('button');
		// button.textContent = 'Submit';
		// button.type = 'submit';

		// button.addEventListener('click', function (e) {
		// 	const obsidianUrl = `obsidian://obsidian-clipper?vault=${vaultName}&notePath=${notePath}&url=${encodeURIComponent(
		// 		url
		// 	)}&title=${encodeURIComponent(
		// 		title
		// 	)}&format=html&highlightdata=${encodeURIComponent(
		// 		content
		// 	)}&comment=${encodeURIComponent(textarea.value)} `;
		// 	console.log(textarea.value);
		//
		// 	modal.style.display = 'none';
		//
		// 	document.location.href = obsidianUrl;
		// });
		//
		// divButtonWrapper.appendChild(button);
		// divWrapper.appendChild(divButtonWrapper);

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
		});
		MicroModal.init();
		MicroModal.show('obsidian-clipper-modal-1');

		// Get it working with window.prompt
		// let comment = window.prompt('Add Comments');
		// if (!comment) {
		// 	comment = '';
		// }
		// return comment;

		//return '';
	}

	function sendToObsidian(url: string, title: string, content: string): void {
		if (includeComment) {
			getComment(url, title, content);
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
})('~VaultNameFiller~', '~NotePath~', true);
