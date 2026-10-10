// Creates a disposable Obsidian vault for manually testing the plugin.
//
//   pnpm seed-vault [path] [--force] [--legacy] [--offline]
//
//   path       Where to create the vault. Default: $CLIPPER_TEST_VAULT or
//              ~/Obsidian/Clipper Test Vault. The folder name is the vault
//              name that bookmarklets and links target.
//   --force    Replace an existing vault that this script created.
//   --legacy   Seed pre-1.0 plugin settings to test the upgrade path.
//   --offline  Skip downloading Hot Reload and Periodic Notes.
import {
	copyFileSync,
	cpSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import * as path from 'node:path';
import {
	BUILD_FILES,
	MARKER,
	ROOT,
	pluginDir,
	requireBuild,
	vaultPath,
} from './vault-path.mjs';

const TESTING = path.join(ROOT, 'testing');

// Pinned helper plugins. Periodic Notes 0.0.17 is the last release with the
// settings shape obsidian-daily-notes-interface reads for weekly notes.
const HELPER_PLUGINS = [
	{
		id: 'hot-reload',
		repo: 'pjeby/hot-reload',
		tag: '0.3.1',
		files: ['main.js', 'manifest.json'],
	},
	{
		id: 'periodic-notes',
		repo: 'liamcain/obsidian-periodic-notes',
		tag: '0.0.17',
		files: ['main.js', 'manifest.json', 'styles.css'],
		data: {
			showGettingStartedBanner: false,
			hasMigratedDailyNoteSettings: true,
			hasMigratedWeeklyNoteSettings: true,
			// Daily notes come from the core Daily Notes plugin.
			daily: { enabled: false, folder: '', format: '', template: '' },
			weekly: {
				enabled: true,
				folder: 'Weekly',
				format: 'gggg-[W]ww',
				template: '',
			},
			monthly: { enabled: false, folder: '', format: '', template: '' },
			quarterly: { enabled: false, folder: '', format: '', template: '' },
			yearly: { enabled: false, folder: '', format: '', template: '' },
		},
	},
];

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const known = new Set(['--force', '--legacy', '--offline']);
for (const flag of flags) {
	if (!known.has(flag)) fail(`Unknown option ${flag}`);
}
const vault = vaultPath(args.find((a) => !a.startsWith('--')));
const vaultName = path.basename(vault);

function fail(message) {
	console.error(message);
	process.exit(1);
}

function writeJson(file, data) {
	writeFileSync(file, JSON.stringify(data, null, '\t') + '\n');
}

// encodeURIComponent leaves ( ) ' ! * alone; parentheses would end a
// Markdown link early.
function enc(value) {
	return encodeURIComponent(value).replace(
		/[()'!*]/g,
		(c) => '%' + c.charCodeAt(0).toString(16).toUpperCase()
	);
}

function clipLink(params) {
	const query = Object.entries({ vault: vaultName, ...params })
		.map(([k, v]) => `${k}=${enc(v)}`)
		.join('&');
	return `obsidian://obsidian-clipper?${query}`;
}

function prepareFolder() {
	if (existsSync(vault) && readdirSync(vault).length > 0) {
		if (!existsSync(path.join(vault, MARKER))) {
			fail(
				`${vault} exists and was not created by this script. Choose another path.`
			);
		}
		if (!flags.has('--force')) {
			fail(`${vault} already exists. Pass --force to replace it.`);
		}
		rmSync(vault, { recursive: true, force: true });
	}
	mkdirSync(vault, { recursive: true });
}

function installClipper() {
	const dir = pluginDir(vault);
	mkdirSync(dir, { recursive: true });
	for (const file of BUILD_FILES) {
		copyFileSync(path.join(ROOT, file), path.join(dir, file));
	}
	// Hot Reload watches plugin folders that contain .hotreload or .git.
	writeFileSync(path.join(dir, '.hotreload'), '');

	const template = flags.has('--legacy')
		? 'legacy-settings.json'
		: 'clipper-settings.json';
	const settings = readFileSync(
		path.join(TESTING, template),
		'utf8'
	).replaceAll('__VAULT_NAME__', vaultName);
	writeFileSync(path.join(dir, 'data.json'), settings);
}

async function download(url) {
	const response = await fetch(url);
	if (!response.ok) throw new Error(`${response.status} for ${url}`);
	return Buffer.from(await response.arrayBuffer());
}

async function installHelpers() {
	const installed = [];
	if (flags.has('--offline')) return installed;
	for (const plugin of HELPER_PLUGINS) {
		const dir = path.join(vault, '.obsidian', 'plugins', plugin.id);
		try {
			mkdirSync(dir, { recursive: true });
			for (const file of plugin.files) {
				const url = `https://github.com/${plugin.repo}/releases/download/${plugin.tag}/${file}`;
				writeFileSync(path.join(dir, file), await download(url));
			}
			if (plugin.data) writeJson(path.join(dir, 'data.json'), plugin.data);
			installed.push(plugin.id);
		} catch (error) {
			rmSync(dir, { recursive: true, force: true });
			console.warn(`Skipped ${plugin.id}: ${error.message}`);
		}
	}
	return installed;
}

function enablePlugins(helpers) {
	writeJson(path.join(vault, '.obsidian', 'community-plugins.json'), [
		'obsidian-clipper',
		...helpers,
	]);
}

function writeTestLinks() {
	const sample =
		'> A sample highlight with **bold** text and a [link](https://obsidian.md).';
	const url = (slug) => `https://example.com/articles/${slug}`;
	const lines = [
		'# Test Links',
		'',
		`Generated by \`pnpm seed-vault\` for the vault **${vaultName}**. Each link sends a clip the same way the bookmarklet does. See [[Start Here]] for what to expect.`,
		'',
	];

	if (flags.has('--legacy')) {
		lines.push(
			'This vault was seeded with **pre-1.0 settings**. Open Settings → Clipper first: the old daily/weekly settings should appear as two clippers (daily and weekly).',
			'',
			'"Capture comments" was on in the old settings, so both converted clippers should have it on.',
			''
		);
	} else {
		const { clippers } = JSON.parse(
			readFileSync(path.join(TESTING, 'clipper-settings.json'), 'utf8')
		);
		lines.push('## One link per clipper', '');
		for (const clipper of clippers) {
			const params = {
				clipperId: clipper.clipperId,
				url: url(clipper.name.toLowerCase().replace(/[^a-z]+/g, '-')),
				title: `Sample Article for ${clipper.name}`,
				highlightdata: sample,
			};
			if (clipper.captureComments) params.comments = 'A test comment';
			lines.push(`- [${clipper.name}](${clipLink(params)})`);
		}
		const research = clippers.find((c) => c.advancedStorage);
		const board = clippers.find((c) => c.type === 'canvas');
		lines.push(
			'',
			'## Variations',
			'',
			`- [${board.name}: second clip from another site](${clipLink({
				clipperId: board.clipperId,
				url: 'https://obsidian.md/blog/post',
				title: 'Another Site',
				highlightdata: sample,
			})}): adds a second domain node`,
			`- [${research.name}: Apple Shortcut style](${clipLink({
				clipperId: research.clipperId,
				url: 'shortcut',
				title: 'From a Shortcut',
				highlightdata: sample,
			})}): no source footnote`,
			`- [Unknown clipper id](${clipLink({
				clipperId: 'not-a-real-clipper',
				url: url('unknown'),
				title: 'Unknown',
				highlightdata: sample,
			})}): nothing is written; a notice says the clipper no longer exists`,
			''
		);
	}

	lines.push(
		'## Pre-1.0 bookmarklets (no clipper id)',
		'',
		`- [Old topic bookmarklet](${clipLink({
			notePath: 'Topics/Rust.md',
			url: url('old-topic'),
			title: 'Old Topic Bookmarklet',
			highlightdata: sample,
		})}): opens the topic migration dialog, then the add-clipper dialog when closed`,
		`- [Old canvas bookmarklet](${clipLink({
			notePath: 'Boards/Research Board.canvas',
			url: url('old-canvas'),
			title: 'Old Canvas Bookmarklet',
			highlightdata: sample,
		})}): the dialog says a Canvas clipper was created, and closing it opens a canvas clipper for the board. The board is not changed`,
		`- [Old daily bookmarklet](${clipLink({
			url: url('old-daily'),
			title: 'Old Daily Bookmarklet',
			highlightdata: sample,
		})}): opens the daily migration dialog, then Clipper settings when closed`,
		''
	);
	writeFileSync(path.join(vault, 'Test Links.md'), lines.join('\n'));
}

requireBuild();
prepareFolder();
cpSync(path.join(TESTING, 'vault'), vault, { recursive: true });
for (const dir of ['Daily', 'Weekly']) {
	rmSync(path.join(vault, dir, '.gitkeep'), { force: true });
}
installClipper();
const helpers = await installHelpers();
enablePlugins(helpers);
writeTestLinks();
writeFileSync(path.join(vault, MARKER), 'Created by testing/seed-vault.mjs\n');

console.log(`Seeded test vault "${vaultName}" at ${vault}
Plugins: obsidian-clipper${helpers.map((h) => `, ${h}`).join('')}${
	flags.has('--legacy') ? '\nSettings: pre-1.0 (legacy)' : ''
}

Next:
  1. Obsidian → Open another vault → Open folder as vault → choose the folder above.
  2. Choose "Trust author and enable plugins".
  3. Open "Start Here".
  4. After code changes: pnpm dev (builds and copies into this vault; Hot Reload picks it up).`);
