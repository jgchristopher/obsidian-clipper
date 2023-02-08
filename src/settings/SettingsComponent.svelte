<script lang="ts">
  import {App} from "obsidian";
  import { slide } from "svelte/transition";
  import { type Writable } from "svelte/store";
  import type {ObsidianClipperSettings} from "../settings"
  import SettingsGroup from "./SettingsGroup.svelte"
  import { BookmarketlGenerator } from "../bookmarkletgenerator";
  
  export let settings: Writable<ObsidianClipperSettings>;
  export let app: App;
  let vaultName = app.vault.getName();
  let clipperHref = new BookmarketlGenerator(vaultName).generateBookmarklet();
</script>

<div class="clp_section_margin">
	<div class="setting-item mod-toggle">
		<div class="setting-item-info">
      <h1 class="setting-item-name">
        Daily Note Entry 
      </h1>
    </div>
    <div class="setting-item-control">
      <label
        class="checkbox-container"
        class:is-enabled={$settings.useDailyNote}
      >
        <input
          type="checkbox"
          bind:checked={$settings.useDailyNote}
        />
      </label>
    </div>
	</div>
  {#if $settings.useDailyNote}
  <div
      in:slide|local={{ duration: 300 }}
      out:slide|local={{ duration: 300 }}
    >

	<div class="setting-item">
		<div class="setting-item-info">
			<div class="setting-item-name">Daily Note Header</div>
			<div class="setting-item-description">
				What header should highlight data be prepended under in your
  daily note?
			</div>
		</div>
		<div class="setting-item-control">
			<input type="text" bind:value={$settings.dailyNoteHeading} spellcheck="false" placeholder="" />
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



<div class="clp_section_margin">
	<div class="setting-item mod-toggle">
		<div class="setting-item-info">
      <h1 class="setting-item-name">
        Weekly Note Entry 
      </h1>
    </div>
    <div class="setting-item-control">
      <label
        class="checkbox-container"
        class:is-enabled={$settings.useWeeklyNote}
      >
        <input
          type="checkbox"
          bind:checked={$settings.useWeeklyNote}
        />
      </label>
    </div>
	</div>
  {#if $settings.useWeeklyNote}
  <div
      in:slide|local={{ duration: 300 }}
      out:slide|local={{ duration: 300 }}
    >

	<div class="setting-item">
		<div class="setting-item-info">
			<div class="setting-item-name">Weekly Note Header</div>
			<div class="setting-item-description">
				What header should highlight data be prepended/appended under in your
  daily note?
			</div>
		</div>
		<div class="setting-item-control">
			<input type="text" bind:value={$settings.weeklyNoteHeading} spellcheck="false" placeholder="" />
		</div>
	</div>
	<div class="setting-item">
		<div class="setting-item-info">
			<div class="setting-item-name">Weekly Note Position</div>
			<div class="setting-item-description">
				Would you like to prepend clippings to the top of the section or
				append them to the bottom of the section?
			</div>
		</div>
		<div class="setting-item-control">
			<select class="dropdown" bind:value={$settings.weeklyPosition}>
				<option value="prepend">prepend</option>
				<option value="append">append</option>
			</select>
		</div>
	</div>
  </div>
  {/if}
</div>

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
					Format you would like to use for the &#123&#123 time &#125&#125 template in
					clippings. See
				</div>
				<a href="https://momentjs.com/docs/#/displaying/format/"
					>format reference</a
				>
			</div>
		</div>
		<div class="setting-item-control">
			<input type="text" bind:value={$settings.timestampFormat} spellcheck="false" placeholder="HH:mm" />
		</div>
	</div>
	<div class="setting-item">
		<div class="setting-item-info">
			<div class="setting-item-name">Clipped Entry Template</div>
			<div class="setting-item-description">
				Choose the file to use as a template for the clipped entry
			</div>
		</div>
		<div class="setting-item-control">
			<input type="text" bind:value={$settings.dailyEntryTemplateLocation} spellcheck="false" />
		</div>
	</div>
</div>

<div>
  <div>
    You can drag or copy the link below to your browser bookmark bar. This bookmarklet will allow you to highlight information on the web and send it to obsidian
  </div>
  <a href={clipperHref}>Obsidian Clipper ({vaultName})</a>
</div>
