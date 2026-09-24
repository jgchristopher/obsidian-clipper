# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An Obsidian plugin ("Clipper", id `obsidian-clipper`). The plugin generates browser bookmarklets. When clicked, a bookmarklet converts the page selection to markdown in the browser and sends it to Obsidian through an `obsidian://obsidian-clipper?...` URI. The plugin receives that URI and writes the clipping into a note. It is not a browser extension (users loading the repo as a Chrome/Edge extension is a recurring support issue).

User docs live at https://docs.obsidianclipper.com (source in `docs/`).

## Commands

Use **pnpm** (version pinned by `packageManager` in `package.json`). There is no npm lockfile. pnpm 10 blocks dependency install scripts, and `pnpm-workspace.yaml` lists the allowed and ignored ones. pnpm 10 ignores those keys in `package.json`.

- `pnpm build`: full pipeline, see below. This is the only reliable way to produce `main.js`.
- `pnpm compile`: type-check only (`tsc -noEmit`). Includes spec files.
- `pnpm dev`: build, then `copy` into a hardcoded local dev-vault plugin folder (`/Users/johnchristopher/gitprojects/obsidian-plugins/dev_plugin_links/obsidian-clipper/`).
- `pnpm test`: runs vitest once. Single file: `pnpm exec vitest run src/utils/fileutils.spec.ts`. Single test: add `-t "<name>"`. Specs live beside the source as `*.spec.ts`. `main.spec.ts` imports the generated bookmarklet generator, so run `pnpm build` once on a fresh checkout before testing.
- Lint: `pnpm exec eslint src` (no script defined).
- `npm version <x>`: the `version` lifecycle script bumps `manifest.json`/`versions.json` via `src/build/version-bump.mjs`. `.npmrc` sets an empty tag prefix, so tags have no `v`.

CI (`.github/workflows/release.yml`) runs on any pushed tag. It does a frozen pnpm install, runs `pnpm build` and `pnpm test`, then publishes a GitHub release with `main.js`, `manifest.json`, `styles.css`, and a zip.

## Build pipeline (order matters)

`pnpm build` runs these in sequence:

1. `build:bookmarklet`: `tsc` compiles `src/build/bookmarkletcode/index.ts` (the code that runs in the browser page), `webpack` bundles it into `src/build/bookmarkletcode/dist/bookmarklet.js`, and the `bookmarklet` CLI minifies it into `obsidian-clipper.min.js`.
2. `build:bookmarkletgen`: `src/bookmarkletlink/build-bookmarkletgenerator.js` reads the minified bookmarklet, replaces the `~ClipperIdFiller~`, `~VaultNameFiller~`, `~HeaderLevelBase~`, `~H1Setting~`…`~H6Setting~`, and `~CaptureComment~` placeholders with template-literal expressions, and writes `src/bookmarkletlink/bookmarkletgenerator.ts`.
3. `compile`: type-check.
4. `tailwindcss`: `input.css` into `styles.css`.
5. `esbuild.config.mjs production`: bundles `src/main.ts` (with Svelte) into `main.js`.

Consequences:

- `src/bookmarkletlink/bookmarkletgenerator.ts` is **generated and gitignored**. Never edit it. Change the bookmarklet in `src/build/bookmarkletcode/` and rebuild. A fresh checkout will not type-check until step 2 has run.
- Any new per-clipper value the bookmarklet needs requires three changes: a new `~Placeholder~` in the bookmarklet source, a replacement in the generator script, and a constructor field in the generator template.
- `webpack.config.js` exists only for the bookmarklet. `esbuild` builds the plugin.

## Architecture

**Clippers are the core model.** `ObsidianClipperPluginSettings` (`src/settings/types.ts`) holds `clippers: ObsidianClipperSettings[]` plus a `version`. Each clipper has a `clipperId` (UUID), a `type` (`daily` | `weekly` | `topic` | `canvas`), a target (`notePath` for topic/canvas, empty for periodic), heading/position/template options, and optional "advanced storage". Every generated bookmarklet or Apple Shortcut link embeds its `clipperId`.

**Inbound flow** (`src/main.ts`, `registerObsidianProtocolHandler`):

- With a `clipperId`: find the clipper, optionally write the full highlight to a per-domain note via `AdvancedNoteEntry` (the entry then becomes a reference), build `ClippedData` (applies the entry template), then `writeNoteEntry` dispatches by type.
- Without a `clipperId`: the URI came from a pre-1.0 bookmarklet. The plugin opens `MigrateTopicNoteModal` (if `notePath` is present) or `MigrateDailyNoteModal` so the user can create a clipper and replace the old bookmarklet.

**Writers:**

- `NoteEntry` (`src/abstracts/`) is the base class. `TopicNoteEntry` and `PeriodicNoteEntry` (daily/weekly, which resolve the note through `obsidian-daily-notes-interface`) extend it.
- `NoteEntry.handleWrite` picks `PrependWriter` or `AppendWriter`. Both extend `FileWriter` (`src/periodicnotes/filewriter.ts`), which does the heading-aware insertion. Heading lookup and creation have open TODOs there.
- `CanvasEntry` is separate. It adds a text node to a `.canvas` file, using dagre for layout.

**Settings migration:** `loadSettings` treats saved data with no `version` key as the old single-config format (`OldClipperSettings`). `mergeExistingSetting` converts its daily and weekly settings into clipper entries. Bump `version` and extend this path if the settings shape changes incompatibly.

**UI** is Svelte 3 (`src/settings/`, `src/views/`). `settingsstore.ts` wraps plugin settings in a writable store. Its `set` also calls `plugin.saveSettings()`, so components save by calling `pluginSettings.set(...)` or `update(...)`. `update` does not save, so use `set` when the change must be written to disk. The `Open view` command shows `BookmarkletLinksView`, which lists each clipper's bookmarklet and shortcut links.

## Tests

- `obsidian` ships types only. `vitest.config.mts` aliases it to `test/mocks/obsidian.ts`. Add a mock there when plugin code starts using a new runtime export.
- `test/fakes/fakeapp.ts` (`FakeApp`) is an in-memory vault, metadata cache, and workspace. Its metadata cache computes headings and the frontmatter section from real file content, so writer tests exercise actual line math. Use `tfile(path)` to pass files into plugin code.
- Several write paths do not await their promises (`NoteEntry.handleWrite`, `TopicNoteEntry.writeToNote`, `PeriodicNoteEntry.writeToPeriodicNote`). Call `await settle()` before asserting on vault contents.
- Svelte components cannot compile under vitest without a Svelte plugin. Mock each `.svelte` import with `test/fakes/sveltestub.ts` (see `main.spec.ts`), which records constructions in `mounted`.
- `obsidian-daily-notes-interface` is mocked per spec with `vi.mock`. `moment` and `createEl` globals are set in `test/setup.ts`.
- Tests marked `// Current behavior:` or `// BUG` pin existing quirks on purpose. Change them together with the source when fixing the quirk, not to make an upgrade pass.
- Not covered: the bookmarklet's in-browser code (`src/build/bookmarkletcode/`) and Svelte UI components.

## Releases

- `manifest.json` holds the last stable release. `manifest-beta.json` holds the current beta (BRAT-style, currently `1.0.0-beta.N`). Beta bumps edit `manifest-beta.json` only.
