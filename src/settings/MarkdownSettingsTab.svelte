<script lang="ts">
	import { settings } from './settingsstore';
</script>

<div class="clp_section_margin">
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
</div>
