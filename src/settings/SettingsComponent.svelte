<script lang="ts">
	import Notice from './Notice.svelte';
	import ClipperSettingsComponent from './components/ClipperSettingsComponent.svelte';
	import { Modal, Platform, type App } from 'obsidian';
	import { pluginSettings } from './settingsstore';
	import moment from 'moment';
	import AddClipperComponent from './components/AddClipperComponent.svelte';
	import type { ObsidianClipperSettings } from './types';

	export let app: App;

	let vaultName = app.vault.getName();
	const noticeText =
		'Lost on how to get started? Check out the new documentation website';

	const handleClick = (id: string) => {
		let settingsIndex = $pluginSettings.clippers.findIndex(
			(c) => c.clipperId === id
		);
		if (settingsIndex !== -1) {
			editSetting(settingsIndex);
		}
	};

	const handleDelete = (id: string) => {
		const remainingClippers = $pluginSettings.clippers.filter(
			(c: ObsidianClipperSettings) => c.clipperId !== id
		);
		$pluginSettings.clippers = remainingClippers;
		pluginSettings.set($pluginSettings);
	};

	const editSetting = (settingsIndex: number) => {
		const settingsScreen = new Modal(this.app);
		settingsScreen.titleEl.createEl('h2', {
			text: 'Edit Clipper Settings',
		});

		new ClipperSettingsComponent({
			target: settingsScreen.contentEl,
			props: {
				app: app,
				settingsIndex,
			},
		});

		settingsScreen.open();
	};
</script>

<Notice>
	<span slot="noticeText">
		{noticeText}
	</span>
	<span slot="calloutLink">
		<a
			href="https://docs.obsidianclipper.com"
			class="whitespace-nowrap font-medium text-blue-700 hover:text-blue-600"
		>
			Details
			<span aria-hidden="true"> &rarr;</span>
		</a>
	</span>
</Notice>

<br />

<div class="flex flex-row-reverse text-sm font-semibold leading-6 gap-2 pb-4">
	<AddClipperComponent {vaultName} />
	<!-- 	<span class="inline-block align-middle">Add Clipper</span> -->
</div>

<div class="px-4 sm:px-6 lg:px-8">
	<div class="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
		<div class="inline-block min-w-full py-2 align-middle">
			<table class="min-w-full border-separate border-spacing-0">
				<thead>
					<tr>
						<th scope="col" class="sticky top-0 z-10 text-left">Name</th>
						<th scope="col" class="sticky top-0 z-10 text-center">Type</th>
						{#if Platform.isDesktop}
							<th scope="col" class="sticky top-0 z-10 text-center">
								Created On
							</th>
						{/if}
						<th scope="col" class="sticky top-0 z-10 text-center" />
					</tr>
				</thead>
				<tbody>
					{#each $pluginSettings.clippers as clipper (clipper.clipperId)}
						<tr>
							<td class="text-left">{clipper.name}</td>
							<td class="text-center">{clipper.type}</td>
							{#if Platform.isDesktop}
								<td class="py-4 pl-4 text-sm text-center">
									Created on <time
										datetime={moment(clipper.createdAt).toISOString()}
									>
										{moment(clipper.createdAt).format('MMMM DD, YYYY')}
									</time>
								</td>
							{/if}
							<td class="text-right">
								<div class="setting-item-control">
									<span
										class="clickable-icon setting-editor-extra-setting-button"
										on:keypress={() => handleClick(clipper.clipperId)}
										on:click={() => handleClick(clipper.clipperId)}
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
											class="svg-icon lucide-settings"
											><path
												d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
											></path><circle cx="12" cy="12" r="3"></circle></svg
										>
									</span>
									{#if $pluginSettings.clippers.length > 1}
										<span
											class="clickable-icon setting-editor-extra-setting-button"
											on:keypress={() => handleDelete(clipper.clipperId)}
											on:click={() => handleDelete(clipper.clipperId)}
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="24"
												height="24"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
												class="svg-icon lucide-trash-2"
												><path d="M3 6h18"></path><path
													d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"
												></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
												></path><line x1="10" y1="11" x2="10" y2="17"
												></line><line x1="14" y1="11" x2="14" y2="17"
												></line></svg
											>
										</span>
									{/if}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
