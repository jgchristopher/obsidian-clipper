import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import * as path from 'node:path';

export const ROOT = path.resolve(import.meta.dirname, '..');

// Marks a folder as created by seed-vault.mjs, so --force only ever deletes
// vaults this script made.
export const MARKER = '.clipper-test-vault';

export const BUILD_FILES = ['main.js', 'manifest.json', 'styles.css'];

export function vaultPath(argPath) {
	const chosen =
		argPath ??
		process.env.CLIPPER_TEST_VAULT ??
		path.join(homedir(), 'Obsidian', 'Clipper Test Vault');
	return path.resolve(chosen.replace(/^~(?=$|\/)/, homedir()));
}

export function pluginDir(vault) {
	return path.join(vault, '.obsidian', 'plugins', 'obsidian-clipper');
}

export function requireBuild() {
	const missing = BUILD_FILES.filter((f) => !existsSync(path.join(ROOT, f)));
	if (missing.length) {
		throw new Error(`Missing ${missing.join(', ')}. Run \`pnpm build\` first.`);
	}
}
