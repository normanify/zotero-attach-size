"use strict";

let _registeredKey = null;
let _notifierID = null;
const _sizeCache = new Map();

function startup({ id, version, rootURI }) {
  _registeredKey = Zotero.ItemTreeManager.registerColumn({
    dataKey: "attachmentSize",
    label: "Size",
    htmlLabel: "Size",
    pluginID: id,
    staticWidth: true,
    showInColumnPicker: true,
    sortReverse: true,
    dataProvider: _dataProvider,
    renderCell: _renderCell,
    zoteroPersist: ["width", "hidden", "sortDirection"],
  });

  _notifierID = Zotero.Notifier.registerObserver({
    notify: (event, type, ids) => {
      if (type === "item" && ["modify", "add", "delete", "remove"].includes(event)) {
        for (const id of ids) _sizeCache.delete(id);
      }
    },
  }, ["item"]);
}

function shutdown() {
  if (_registeredKey) {
    try { Zotero.ItemTreeManager.unregisterColumn(_registeredKey); } catch (e) {}
    _registeredKey = null;
  }
  if (_notifierID) {
    try { Zotero.Notifier.unregisterObserver(_notifierID); } catch (e) {}
    _notifierID = null;
  }
  _sizeCache.clear();
}

function install() {}
function uninstall() {}

function _dataProvider(item, dataKey) {
  try {
    if (typeof item.isFileAttachment === "function" && item.isFileAttachment()) {
      return _attachmentSize(item);
    }
    if (typeof item.isRegularItem === "function" && item.isRegularItem()) {
      return _regularItemSize(item);
    }
    return null;
  } catch (e) {
    return null;
  }
}

function _attachmentSize(item) {
  try {
    let path = item.getFilePath();
    if (!path) return 0;
    let size = _rawFileSize(path);
    _sizeCache.set(item.id, size);
    return size;
  } catch (e) {
    return 0;
  }
}

function _regularItemSize(item) {
  try {
    let attIDs = item.getAttachments();
    if (!attIDs || attIDs.length === 0) return null;

    let total = 0;
    for (let id of attIDs) {
      if (_sizeCache.has(id)) {
        total += _sizeCache.get(id);
        continue;
      }
      let att = Zotero.Items.get(id);
      if (!att) continue;
      if (typeof att.isFileAttachment !== "function" || !att.isFileAttachment()) continue;

      let path = att.getFilePath();
      if (!path) continue;

      let size = _rawFileSize(path);
      _sizeCache.set(id, size);
      total += size;
    }
    return total;
  } catch (e) {
    return null;
  }
}

function _rawFileSize(path) {
  try {
    let file = Components.classes["@mozilla.org/file/local;1"]
      .createInstance(Components.interfaces.nsIFile);
    file.initWithPath(path);
    return file.fileSize;
  } catch (e) {
    try {
      let stat = OS.File.stat(path);
      return stat.size;
    } catch (e2) {
      return 0;
    }
  }
}

function _renderCell(index, data, column, isFirstColumn, doc) {
  let cell = doc.createElement("span");
  cell.className = "cell " + column.className + " attachSize";
  if (data == null || data <= 0) {
    cell.textContent = "";
  } else {
    cell.textContent = _formatSize(typeof data === "number" ? data : 0);
  }
  cell.style = "text-align: right;";
  return cell;
}

function _formatSize(bytes) {
  if (!bytes || bytes <= 0) return "";
  let units = ["B", "K", "M", "G", "T"];
  let idx = 0;
  let size = bytes;
  while (size >= 1024 && idx < units.length - 1) {
    size /= 1024;
    idx++;
  }
  if (idx === 0) return bytes + " B";
  return size.toFixed(1) + " " + units[idx];
}
