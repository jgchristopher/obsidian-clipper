<script lang="ts">
	import { slide } from 'svelte/transition';
	import { settings } from './settingsstore';
</script>

<div class="clp_section_margin">
	<div class="setting-item mod-toggle">
		<div class="setting-item-info">
			<h1 class="setting-item-name">Daily Note Entry</h1>
		</div>
		<div class="setting-item-control">
			<label
				class="checkbox-container"
				class:is-enabled={$settings.useDailyNote}
			>
				<input type="checkbox" bind:checked={$settings.useDailyNote} />
			</label>
		</div>
	</div>
	{#if $settings.useDailyNote}
		<div in:slide|local={{ duration: 300 }} out:slide|local={{ duration: 300 }}>
			<div class="setting-item">
				<div class="setting-item-info">
					<div class="setting-item-name">Daily Note Header</div>
					<div class="setting-item-description">
						What header should highlight data be prepended under in your daily
						note?
					</div>
				</div>
				<div class="setting-item-control">
					<input
						type="text"
						bind:value={$settings.dailyNoteHeading}
						spellcheck="false"
						placeholder=""
					/>
				</div>
			</div>
			<div class="setting-item">
				<div class="setting-item-info">
					<div class="setting-item-name">Daily Note Position</div>
					<div class="setting-item-description">
						Would you like to prepend clippings to the top of the section or
						append them to the bottom of the section?
					</div>
				</div>
				<div class="setting-item-control">
					<select class="dropdown" bind:value={$settings.dailyPosition}>
						<option value="prepend">prepend</option>
						<option value="append">append</option>
					</select>
				</div>
			</div>
		</div>
	{/if}
</div>
