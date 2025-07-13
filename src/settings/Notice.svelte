<div class="clp-rounded-md clp-bg-blue-50 clp-p-4">
	<div class="flex">
		<div class="clp-flex-shrink-0">
			<svg
				class="clp-h-5 clp-w-5 clp-text-blue-400"
				viewBox="0 0 20 20"
				fill="currentColor"
				aria-hidden="true"
			>
				<path
					fill-rule="evenodd"
					d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
					clip-rule="evenodd"
				/>
			</svg>
		</div>
		<div class="clp-ml-3 clp-flex-1 md:clp-flex md:clp-justify-between">
			<p class="clp-text-sm clp-text-blue-700">
				<slot name="noticeText">
					<span />
				</slot>
			</p>
			<p class="clp-mt-3 clp-text-sm md:clp-mt-0 md:clp-ml-6">
				<slot name="calloutLink" />
			</p>
		</div>
	</div>
</div>
