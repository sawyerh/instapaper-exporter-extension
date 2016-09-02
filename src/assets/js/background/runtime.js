const filename = 'instapaper_highlights_export.json';

function save(highlights) {
  console.log('save', highlights);
  const json = JSON.stringify(highlights);
  const blob = new Blob([json], {
    encoding: "UTF-8",
    type: "application/json;charset=UTF-8"
  });
  const size = blob.size + (1024 / 2);
  const errback = function(){};

  // create a blob for writing to a file
  var reqFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
  reqFileSystem(window.TEMPORARY, size, function(fs){
      fs.root.getFile(filename, {create: true}, function(fileEntry) {
          fileEntry.createWriter(function(fileWriter) {
              fileWriter.onwriteend = openExport;
              fileWriter.write(blob);
          }, errback);
      }, errback);
  }, errback);
}

function openExport() {
  // open the file that now contains the blob - calling
  // `openPage` again if we had to split up the image
  let url = ('filesystem:chrome-extension://' +
                 chrome.i18n.getMessage('@@extension_id') +
                 '/temporary/' + filename);

  chrome.tabs.create({url: url});
}

function handleActionClick(e) {
  console.log('handleActionClick');
  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, {message: 'scrape_page'}, save);
  });
}

function handleInstalled(details) {
  if (details.reason === "install") {
    // TODO: Open tab with instructions
    // chrome.tabs.create({
    //   url: 'http://www.dropmark.com/extension/welcome'
    // });
  }
}

/**
 * Handle any runtime messages that aren't handled elsewhere.
 * https://developer.chrome.com/extensions/runtime#event-onMessage
 */
 function handleMessage(request, sender, callback) {
  console.log('runtime handleMessage');
}

chrome.browserAction.onClicked.addListener(handleActionClick);
chrome.runtime.onMessage.addListener(handleMessage);

if (chrome.runtime.onInstalled)
  chrome.runtime.onInstalled.addListener(handleInstalled);
