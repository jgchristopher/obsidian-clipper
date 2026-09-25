// Copies the current build into the seeded test vault. Writing the files
// inside the vault (not symlinking) is what lets Hot Reload see the change.
import { copyFileSync, existsSync } from 'node:fs';
import * as path from 'node:path';
import {
	BUILD_FILES,
	MARKER,
	ROOT,
	pluginDir,
	requireBuild,
	vaultPath,
} from './vault-path.mjs';

const vault = vaultPath(process.argv[2]);

if (!existsSync(path.join(vault, MARKER))) {
	console.error(
		`No seeded test vault at ${vault}.\nRun \`pnpm seed-vault\` first, or set CLIPPER_TEST_VAULT.`
	);
	process.exit(1);
}
requireBuild();

const dest = pluginDir(vault);
for (const file of BUILD_FILES) {
	copyFileSync(path.join(ROOT, file), path.join(dest, file));
}
console.log(`Copied ${BUILD_FILES.join(', ')} to ${dest}`);
