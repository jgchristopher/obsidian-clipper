<script>
	document.addEventListener('DOMContentLoaded', function () {
		try {
			MicroModal.init({
				awaitCloseAnimation: true, // set to false, to remove close animation
				onShow: function (modal) {
					console.log('micromodal open');
				},
				onClose: function (modal) {
					console.log('micromodal close');
				},
			});
		} catch (e) {
			console.log('micromodal error: ', e);
		}
	});
</script>

<div
	style="display: none; font-family: -apple-system, BlinkMacSystemFont, avenir next, avenir,
			helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial,
			sans-serif;"
	class="modal micromodal-slide"
	id="modal-1"
	aria-hidden="true"
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
		height: 100%;
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
					Modal content
				</div>
				<footer class="modal__footer">
					<button
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

<button class="external" data-micromodal-trigger="modal-1"
	>Open Modal Dialog</button
>

<div class="other-links">
	<h2>More pens on Micromidal</h2>

	<a href="https://codepen.io/charles1971/pen/qBELEVN" target="_blank"
		>Micromodal 2</a
	>
</div>

<style>
	/**************************
  Basic Modal Styles
**************************/

	.modal {
		font-family: -apple-system, BlinkMacSystemFont, avenir next, avenir,
			helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial,
			sans-serif;
	}

	.modal__overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.75);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 10;
	}

	.modal__container {
		background-color: #fff;
		padding: 30px;
		max-width: 740px;
		height: 100%;
		width: 50%;
		border-radius: 4px;
		overflow-y: auto;
		box-sizing: border-box;
	}

	@supports (display: flex) {
		.modal__container {
			height: initial;
			max-height: 80vh;
		}
	}

	.modal__header {
		position: relative;
		display: block;
		height: 30px;
		margin-bottom: 20px;
	}

	@supports (display: flex) {
		.modal__header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			height: initial;
			margin-bottom: 0px;
		}
	}

	.modal__title {
		position: absolute;
		top: 20px;
		left: 20px;
		margin-top: 0;
		margin-bottom: 0;
		font-weight: 600;
		font-size: 1.25rem;
		line-height: 1.25;
		color: #00449e;
		box-sizing: border-box;
	}

	.modal__close {
		position: absolute;
		top: 20px;
		right: 20px;
		background: transparent;
		border: 0;
		cursor: pointer;
		margin: 0px;
		padding: 0px;
	}

	@supports (display: flex) {
		.modal__title {
			position: static;
		}

		.modal__close {
			position: static;
		}
	}

	.modal__header .modal__close:before {
		content: '\2715';
	}

	.modal__content {
		margin-top: 10px;
		margin-bottom: 10px;
		color: rgba(0, 0, 0, 0.8);
	}

	@supports (display: flex) {
		.modal__content {
			margin-top: 2rem;
			margin-bottom: 2rem;
			line-height: 1.5;
		}
	}

	.modal__btn {
		font-size: 0.875rem;
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
	}

	.modal__btn-primary {
		background-color: #00449e;
		color: #fff;
	}

	/**************************
  Demo Animation Style
**************************/

	@keyframes mmfadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes mmfadeOut {
		from {
			opacity: 1;
		}
		to {
			opacity: 0;
		}
	}

	@keyframes mmslideIn {
		from {
			transform: translateY(15%);
		}
		to {
			transform: translateY(0);
		}
	}

	@keyframes mmslideOut {
		from {
			transform: translateY(0);
		}
		to {
			transform: translateY(-10%);
		}
	}

	.micromodal-slide {
		display: none;
	}

	.micromodal-slide.is-open {
		display: block;
	}

	.micromodal-slide[aria-hidden='false'] .modal__overlay {
		animation: mmfadeIn 0.3s cubic-bezier(0, 0, 0.2, 1);
	}

	.micromodal-slide[aria-hidden='false'] .modal__container {
		animation: mmslideIn 0.3s cubic-bezier(0, 0, 0.2, 1);
	}

	.micromodal-slide[aria-hidden='true'] .modal__overlay {
		animation: mmfadeOut 0.3s cubic-bezier(0, 0, 0.2, 1);
	}

	.micromodal-slide[aria-hidden='true'] .modal__container {
		animation: mmslideOut 0.3s cubic-bezier(0, 0, 0.2, 1);
	}

	.micromodal-slide .modal__container,
	.micromodal-slide .modal__overlay {
		will-change: transform;
	}

	/**************************
  Custom styles for individual modals
**************************/

	.modal__container button {
		outline: none;
		cursor: pointer !important;
	}

	.modal__container h2.modal__title {
		color: #595959;
	}

	.modal__header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.modal__title {
		margin-top: 0;
		margin-bottom: 0;
		font-weight: 600;
		font-size: 1.25rem;
		line-height: 1.25;
		color: #00449e;
		box-sizing: border-box;
	}

	.modal__close {
		font-size: 24px;
	}

	.modal__content {
		margin-top: 2rem;
		margin-bottom: 2rem;
		line-height: 1.5;
		color: rgba(0, 0, 0, 0.8);
	}

	.modal__btn {
		padding: 10px 15px;
		background-color: #e6e6e6;
		border-radius: 4px;
		-webkit-appearance: none;
	}

	/**************************
  Mobile custom styles for individual modals
**************************/

	@media only screen and (min-device-width: 320px) and (max-device-width: 480px) {
		.modal__container {
			width: 90% !important;
			min-width: 90% !important;
		}

		@supports (display: flex) {
			.modal__container {
				width: 90% !important;
				min-width: 90% !important;
			}
		}
	}

	/**************************
  Non modal styles
**************************/

	button.external {
		padding: 10px !important;
		font-weight: bold;
		background: rgba(0, 0, 0, 0.05);
		border-radius: 15px;
	}

	.other-links {
		padding: 5px;
		font-family: -apple-system, BlinkMacSystemFont, avenir next, avenir,
			helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial,
			sans-serif;
	}

	.other-links h2 {
		font-size: 12px;
	}

	.other-links a {
		font-size: 12px;
	}
</style>
