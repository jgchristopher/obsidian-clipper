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
								<button
									on:keypress={() => handleClick(clipper.clipperId)}
									on:click={() => handleClick(clipper.clipperId)}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										x="0px"
										y="0px"
										width="24"
										height="24"
										viewBox="0 0 24 24"
									>
										<path
											class="clp_action_buttons"
											d="M 18.414062 2 C 18.158062 2 17.902031 2.0979687 17.707031 2.2929688 L 15.707031 4.2929688 L 14.292969 5.7070312 L 3 17 L 3 21 L 7 21 L 21.707031 6.2929688 C 22.098031 5.9019687 22.098031 5.2689063 21.707031 4.8789062 L 19.121094 2.2929688 C 18.926094 2.0979687 18.670063 2 18.414062 2 z M 18.414062 4.4140625 L 19.585938 5.5859375 L 18.292969 6.8789062 L 17.121094 5.7070312 L 18.414062 4.4140625 z M 15.707031 7.1210938 L 16.878906 8.2929688 L 6.171875 19 L 5 19 L 5 17.828125 L 15.707031 7.1210938 z"
										></path>
									</svg>
								</button>
								{#if $pluginSettings.clippers.length > 1}
									<button
										on:keypress={() => handleDelete(clipper.clipperId)}
										on:click={() => handleDelete(clipper.clipperId)}
										><svg
											xmlns="http://www.w3.org/2000/svg"
											x="0px"
											y="0px"
											width="24"
											height="24"
											viewBox="0 0 24 24"
										>
											<path
												class="clp_action_buttons"
												d="M 10 2 L 9 3 L 4 3 L 4 5 L 5 5 L 5 20 C 5 20.522222 5.1913289 21.05461 5.5683594 21.431641 C 5.9453899 21.808671 6.4777778 22 7 22 L 17 22 C 17.522222 22 18.05461 21.808671 18.431641 21.431641 C 18.808671 21.05461 19 20.522222 19 20 L 19 5 L 20 5 L 20 3 L 15 3 L 14 2 L 10 2 z M 7 5 L 17 5 L 17 20 L 7 20 L 7 5 z M 9 7 L 9 18 L 11 18 L 11 7 L 9 7 z M 13 7 L 13 18 L 15 18 L 15 7 L 13 7 z"
											></path>
										</svg>
									</button>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
