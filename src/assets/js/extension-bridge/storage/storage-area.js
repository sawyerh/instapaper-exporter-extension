const methods = ['get', 'getBytesInUse', 'set', 'remove', 'clear'];

/**
 * Create a new StorageArea
 * @param  {String} prop - One of: sync, local, or managed
 * @return {Object} The StorageArea functions
 */
function storageArea(prop) {
  let storage = {};

  methods.forEach(method => {
    if (chrome.storage[prop][method])
      storage[method] = chrome.storage[prop][method].bind(chrome.storage[prop]);
  });

  return storage;
}

export default storageArea;