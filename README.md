# Zotero Attachment Size

A Zotero 9 plugin that adds a **Size** column to the item list, showing the total file size of attachments for each item. File sizes are intelligently displayed in B, K, MB, or GB units.

## Features

- Adds a **Size** column to the main item tree
- Shows the total attachment size for parent items (sum of all child attachments)
- Shows individual file size for attachment items
- Human-readable format: `1.2 G`, `3.5 M`, `860 K`, `512 B`
- Automatic cache invalidation when items are modified
- Sortable column (right-aligned, larger-first by default)

## Installation

1. Download the latest `.xpi` from [Releases](https://github.com/normanify/zotero-attach-size/releases)
2. In Zotero: **Tools → Plugins** → ⚙ → **Install Plugin From File…**
3. Select the downloaded `.xpi` file
4. Restart Zotero

## Usage

After installation and restart:

1. Right-click on any column header in the item list
2. Check **Size** in the column picker
3. The column displays attachment sizes automatically

![Screenshot](sample.png)

## Build from Source

```bash
git clone https://github.com/normanify/zotero-attach-size.git
cd zotero-attach-size
zip -r ../attach-size@norman.xpi . -x ".*" -x "__MACOSX"
```

## Compatibility

- Zotero 9.0+
- Built on the bootstrapped plugin architecture (manifest.json + bootstrap.js)

## How It Works

The plugin registers a custom column via `Zotero.ItemTreeManager.registerColumn()`. The `dataProvider` iterates through each item's attachments, retrieves file paths via `item.getFilePath()`, and reads file sizes using XPCOM (`nsIFile`). Results are cached in memory and invalidated via `Zotero.Notifier` when items change.

## Credits

Inspired by [zotero-attachment-scanner](https://github.com/SciImage/zotero-attachment-scanner).

## License

MIT
