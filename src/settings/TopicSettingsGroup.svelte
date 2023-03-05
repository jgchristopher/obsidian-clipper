<script lang="ts">
	import type { App } from 'obsidian';
	import Suggest from './components/Suggest.svelte';
	import { settings } from './settingsstore';

	export let app: App;
	const onChange = (entry: string) => {
		$settings.topicEntryTemplateLocation = entry;
	};
</script>

<div class="clp_section_margin">
	<div class="settings-item">
		<Suggest
			name="Clipped Entry Template - Topic"
			description="Choose the file to use as a template for the clipped entry a topic note"
			initialValue={$settings.topicEntryTemplateLocation}
			dataProvider={() => app.vault.getMarkdownFiles()}
			{onChange}
		/>
	</div>
</div>
