<script lang="ts">
	import { slide } from 'svelte/transition';
	import { settings } from './settingsstore';
	import { propertyStore } from 'svelte-writable-derived';

	let chosenSettingStore = propertyStore(settings, ['clippers', 0]);
</script>

<div class="clp_section_margin">
	<h1>Advanced Settings</h1>
	<div class="setting-item mod-toggle">
		<div class="setting-item-info">
			<div class="setting-item-name">Store Clippings Per Domain</div>
			<div class="setting-item-description">
				Creates a note per top-level domain and stores all clippings from that
				domain within it. It will add an embedded document link in your Daily
				Note.
			</div>
		</div>
		<div class="setting-item-control">
			<label
				class="checkbox-container"
				class:is-enabled={$chosenSettingStore.advanced}
			>
				<input type="checkbox" bind:checked={$chosenSettingStore.advanced} />
			</label>
		</div>
	</div>
	{#if $chosenSettingStore.advanced}
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
						bind:value={$chosenSettingStore.advancedStorageFolder}
						spellcheck="false"
						placeholder=""
					/>
				</div>
			</div>
		</div>
	{/if}
</div>
<div class="clp_section_margin">
	<h1>Experimental Settings</h1>
	<div class="setting-item mod-toggle">
		<div class="setting-item-info">
			<h1 class="setting-item-name">Support Canvas</h1>
		</div>
		<div class="setting-item-control">
			<label
				class="checkbox-container"
				class:is-enabled={$chosenSettingStore.experimentalCanvas}
			>
				<input
					type="checkbox"
					bind:checked={$chosenSettingStore.experimentalCanvas}
				/>
			</label>
		</div>
	</div>
	<div class="setting-item mod-toggle" style="border-top: none !important;">
		<div class="setting-item-info">
			<h1 class="setting-item-name">Comment Support in Browser</h1>
			<div class="setting-item-description">
				After enabling this option, you must go to the 'Browser' tab, update
				your settings to turn on the 'Capture Comment in Browser' setting and
				reinstall the bookmarklet.
			</div>
		</div>
		<div class="setting-item-control">
			<label
				class="checkbox-container"
				class:is-enabled={$chosenSettingStore.experimentalBookmarkletComment}
			>
				<input
					type="checkbox"
					bind:checked={$chosenSettingStore.experimentalBookmarkletComment}
				/>
			</label>
		</div>
	</div>
</div>
