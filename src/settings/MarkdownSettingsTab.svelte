<script lang="ts">
	import { settings } from './settingsstore';
</script>

<div class="clp_section_margin">
	<div class="setting-item">
		<div class="setting-item-info">
			<h1 class="setting-item-name">Headings</h1>
		</div>
	</div>
	<div class="setting-item">
		<div class="setting-item-info">
			<div class="setting-item-name">H1</div>
			<div class="setting-item-description">
				What should replace H1 elements found in the highlight data?
			</div>
		</div>
		<div class="setting-item-control">
			<input
				type="text"
				bind:value={$settings.markdownSettings.h1}
				spellcheck="false"
				placeholder=""
			/>
		</div>
	</div>
	<div class="setting-item">
		<div class="setting-item-info">
			<div class="setting-item-name">H2</div>
			<div class="setting-item-description">
				What should replace H2 elements found in the highlight data?
			</div>
		</div>
		<div class="setting-item-control">
			<input
				type="text"
				bind:value={$settings.markdownSettings.h2}
				spellcheck="false"
				placeholder=""
			/>
		</div>
	</div>
	<div class="setting-item">
		<div class="setting-item-info">
			<div class="setting-item-name">H3</div>
			<div class="setting-item-description">
				What should replace H3 elements found in the highlight data?
			</div>
		</div>
		<div class="setting-item-control">
			<input
				type="text"
				bind:value={$settings.markdownSettings.h3}
				spellcheck="false"
				placeholder=""
			/>
		</div>
	</div>
	<div class="setting-item">
		<div class="setting-item-info">
			<div class="setting-item-name">H4</div>
			<div class="setting-item-description">
				What should replace H4 elements found in the highlight data?
			</div>
		</div>
		<div class="setting-item-control">
			<input
				type="text"
				bind:value={$settings.markdownSettings.h4}
				spellcheck="false"
				placeholder=""
			/>
		</div>
	</div>
	<div class="setting-item">
		<div class="setting-item-info">
			<div class="setting-item-name">H5</div>
			<div class="setting-item-description">
				What should replace H5 elements found in the highlight data?
			</div>
		</div>
		<div class="setting-item-control">
			<input
				type="text"
				bind:value={$settings.markdownSettings.h5}
				spellcheck="false"
				placeholder=""
			/>
		</div>
	</div>
	<div class="setting-item">
		<div class="setting-item-info">
			<div class="setting-item-name">H6</div>
			<div class="setting-item-description">
				What should replace H6 elements found in the highlight data?
			</div>
		</div>
		<div class="setting-item-control">
			<input
				type="text"
				bind:value={$settings.markdownSettings.h6}
				spellcheck="false"
				placeholder=""
			/>
		</div>
	</div>
</div>
