// https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/Storage/sync
import local from './local';
import storageArea from './storage-area';

function getStorageArea() {
  // Firefox 48 doesn't support the sync StorageArea:
  if (typeof chrome.storage.sync === 'undefined')
    return local;

  return storageArea('sync');
}

const StorageArea = getStorageArea();
export default StorageArea;