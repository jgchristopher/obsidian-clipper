# Start Here

This vault was created by `pnpm seed-vault` from `testing/` in the obsidian-clipper repo. Reseed with `pnpm seed-vault --force` to start over. After code changes, `pnpm dev` rebuilds and copies the plugin here, and Hot Reload reloads it.

Keep the developer console open (Cmd+Opt+I). Svelte errors show up there even when the screen looks fine.

## Clippers in this vault

| Clipper | Writes to | What it exercises |
| --- | --- | --- |
| Daily | `Daily/<today>.md` | Creates today's note from `Templates/Daily Note`, appends under **Clippings**, opens the note |
| Weekly | `Weekly/<week>.md` | Needs Periodic Notes. Creates this week's note, then adds a **Clippings** heading |
| Rust | [[Rust]] | Appends under **Clips**, above **Notes**; frontmatter; tags `#rust #toread` |
| Reading List | [[Reading List]] | Prepends under **Queue**; asks for a comment (bookmarklet) |
| No Heading Yet | [[No Heading Yet]] | Creates the missing **Clips** heading at the end of the note |
| Research | [[Research]] | Advanced storage: highlight goes to `Clippings/<domain>.md`, embed goes here |
| Templated | [[Templated]] | Renders through `Templates/Clip Entry.md` |
| Research Board | `Boards/Research Board.canvas` | Adds a site node and a clip below it; a second clip from the same site goes below the first; a new site goes to the right |
| Board With File Node | `Boards/Board With File Node.canvas` | Takes clips without moving or changing the existing file node |
| Research Board (saved by file name) | `Boards/Research Board.canvas` | Saved the way the old Canvas Bookmarklet command did (file name only). The first clip finds the board and saves its full path on the clipper |

## 1. Settings UI

- [ ] Settings → Clipper lists all clippers with a "Created on" date
- [ ] `+` opens the add-clipper popup; adding a clipper shows it in the list
- [ ] The gear icon opens "Edit Clipper Settings"; the Base, Browser, and Advanced tabs all render
- [ ] A changed setting survives closing and reopening settings
- [ ] Deleting a clipper removes it
- [ ] Command palette → "Clipper: Open view" lists each clipper's links

## 2. Clips without a browser

- [ ] Every link in [[Test Links]] lands where the table above says
- [ ] The "second clip from another site" link adds a second domain node to the board
- [ ] The Apple Shortcut link adds a clip to `Clippings/shortcut.md` without a source footnote
- [ ] The old-bookmarklet links open the migration dialogs

## 3. Clips from the browser

1. Serve the sample page: `pnpm sample-page`, then open <http://localhost:8765/sample-page.html>.
2. Settings → Clipper → gear → **Browser** tab: drag the clipper link to the bookmarks bar.
3. Select part of the sample page and click the bookmarklet.

- [ ] Headings, formatting, lists, code, quotes, and links convert to Markdown
- [ ] The relative link becomes `http://localhost:8765/relative/path`
- [ ] Tables arrive as Markdown tables, with the right-aligned column as `---:`
- [ ] The Reading List bookmarklet shows a comment box, and the comment lands in the note

Clipper IDs are fixed in `testing/clipper-settings.json`, so bookmarks keep working after a reseed, as long as the vault name stays the same.

## 4. Upgrading from pre-1.0

- [ ] `pnpm seed-vault --force --legacy`, open the vault: Settings → Clipper shows a daily and a weekly clipper converted from the old settings
- [ ] "Capture comments" was on in the old settings and is still on for both converted clippers
- [ ] The "Old canvas bookmarklet" link says a Canvas clipper was created. After closing the dialog, Settings → Clipper lists a canvas clipper for `Boards/Research Board.canvas` and the board still opens

## 5. Mobile

- [ ] Sync this vault to a phone (or install a beta through BRAT) and check that Clipper loads and its settings tab opens
