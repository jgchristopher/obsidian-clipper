# Clipper for Obsidian

This plugin allows users to configure and install bookmarklets or
Chrome-based browser extensions that can capture web highlights as Markdown entries in different Obsidian notes.

Clipper bookmarklets can be configured to write to periodic notes (daily or weekly), any other markdown note, or a canvas in Obsidian.

The bookmarklet will have all needed dependencies and will not fail due to cross-origin script errors.

## Installation and How to Use

[Documentation Site](https://docs.obsidianclipper.com)

Check out the video about getting started [here.](https://youtu.be/kINRwNG2LCQ)

[![Default Behaviour](https://img.youtube.com/vi/kINRwNG2LCQ/0.jpg)](https://youtu.be/kINRwNG2LCQ)

## Requirements

[Periodic Notes Plugin](obsidian://show-plugin?id=periodic-notes) to clip to a weekly note.

## Network Use Notice

This plugin can call out to an [external service](https://obsidianclipper.com) that creates a Chrome-based
browser extension wrapper around the generated bookmarklet for your vault or note.
The Chrome-based extension is the only way to interact with Obsidian Clipper
in browsers like [Arc](https://arc.net/). The code for this external service is maintained by me and can be found on [Github](https://github.com/jgchristopher/obsidian_clipper_extension_maker)

## Chrome-based Browser Extension

Obsidian Clipper gives you the option to download a Chrome-based browser extension instead of the bookmarklet.
This can be useful for browsers like Arc that don't support bookmarklets. Below are some instructions on how to use the extension once downloaded.

**Once the obsidian-clipper-extention.zip file is downloaded, follow these instructions.**

1. Unzip the obsidian-clipper-extention.zip file.
2. Open a Chromium-based browser and navigate to the Manage Extensions... view.
3. You will need to enable Developer mode.
4. a Load unpacked button should become available once Developer mode is enabled.
5. Click the Load unpacked button, navigate to the unzipped obsidian-clipper-extension directory, and select it.

## Have Ideas/Requests/Bugs?

Please feel free to create an [Issue](https://github.com/jgchristopher/obsidian-clipper/issues/new/choose)

or

Start a new [discussion](https://github.com/jgchristopher/obsidian-clipper/discussions/new)

## Prior Work and Inspiration

I originally got this idea from modifying the Gist found in this [Obisdian Forum post](https://forum.obsidian.md/t/obsidian-web-clipper-bookmarklet-with-full-markdown-support-for-images-headings-and-code-blocks/22068).

I used the following Obsidian Plugin repos as examples of accomplishing my goal.

- [Obsidian Advanced URI](https://github.com/Vinzent03/obsidian-advanced-uri)
- [Obisidan Periodic Notes](https://github.com/liamcain/obsidian-periodic-notes)
- [Turndown Ext](https://github.com/jtreml/turndown) to manage HTML tables

### Dependencies used in development

- [Obsidian Periodic Note Interface](https://github.com/liamcain/obsidian-daily-notes-interface)
- [Turndown](https://github.com/mixmark-io/turndown) is used in the bookmarklet code to parse highlighted HTML and convert it to Markdown

Do you like the plugin and would want to support its development?

<a href="https://www.buymeacoffee.com/jgchristopher" target="_blank">
	<img src="https://cdn.buymeacoffee.com/buttons/v2/default-violet.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" >
</a>
