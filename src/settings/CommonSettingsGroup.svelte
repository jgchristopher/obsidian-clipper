<script lang="ts">
	import { slide } from 'svelte/transition';
	import { settings } from './settingsstore';
</script>

<div class="clp_section_margin">
	<h1>Common Settings</h1>
	<div class="setting-item">
		<div class="setting-item-info">
			<div class="setting-item-name">Tags</div>
			<div class="setting-item-description">
				What tags would you like added to the captured highlights?
			</div>
		</div>
		<div class="setting-item-control">
			<input
				type="text"
				bind:value={$settings.tags}
				spellcheck="false"
				placeholder="tags,seperated,by,commas"
			/>
		</div>
	</div>
	<div class="setting-item">
		<div class="setting-item-info">
			<div class="setting-item-name">Date Time Format</div>
			<div class="setting-item-description">
				<div>
					Format you would like to use for the &#123&#123 time &#125&#125
					template in clippings. See
				</div>
				<a href="https://momentjs.com/docs/#/displaying/format/"
					>format reference</a
				>
			</div>
		</div>
		<div class="setting-item-control">
			<input
				type="text"
				bind:value={$settings.timestampFormat}
				spellcheck="false"
				placeholder="HH:mm"
			/>
		</div>
	</div>
	
</div>

<div class="clp_section_margin">
	<div class="setting-item mod-toggle">
		<div class="setting-item-info">
			<h1 class="setting-item-name">Advanced Usage</h1>
		</div>
		<div class="setting-item-control">
			<label class="checkbox-container" class:is-enabled={$settings.advanced}>
				<input type="checkbox" bind:checked={$settings.advanced} />
			</label>
		</div>
	</div>
	{#if $settings.advanced}
		<div in:slide|local={{ duration: 300 }} out:slide|local={{ duration: 300 }}>
			<div class="setting-item">
				<div class="setting-item-info">
					<div class="setting-item-name">Clipped Entry Storage Location</div>
					<div class="setting-item-description">
						Choose the folder to store all of your clippings. A note per domain
						clipped from. Default is a `clippings`
					</div>
				</div>
				<div class="setting-item-control">
					<input
						type="text"
						bind:value={$settings.advancedStorageFolder}
						spellcheck="false"
						placeholder=""
					/>
				</div>
			</div>
		</div>
	{/if}
</div>
