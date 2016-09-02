function save(highlights) {
  console.log(arguments);
  console.log('save', highlights);
  const json = JSON.stringify(highlights);
  console.log(json);
  const blob = new Blob([json], {
    encoding: "UTF-8",
    type: "application/json;charset=UTF-8"
  });
  const size = blob.size + (1024 / 2);
  const filename = `instapaper_highlights_export-${Date.now()}.json`;

  // create a blob for writing to a file
  var reqFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
  reqFileSystem(window.TEMPORARY, size, fs => {
    fs.root.getFile(filename, {create: true}, fileEntry => {
      fileEntry.createWriter(fileWriter => {
        fileWriter.onwriteend = openExport.bind(null, filename);
        fileWriter.write(blob);
      });
    });
  });
}

function openExport(filename) {
  // open the file that now contains the blob - calling
  // `openPage` again if we had to split up the image
  let url = ('filesystem:chrome-extension://' +
                 chrome.i18n.getMessage('@@extension_id') +
                 '/temporary/' + filename);

  // chrome.tabs.create({url: url});
  chrome.downloads.download({
    filename: filename,
    url: url,
    saveAs: true
  });
}

function handleActionClick(e) {
  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, {message: 'scrape_page'});
  });
}

function handleInstalled(details) {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    var rule = {
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {
            urlContains: 'instapaper.com/notes',
            schemes: ['https']
          }
        })
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    };

    chrome.declarativeContent.onPageChanged.addRules([rule]);
  });

  if (details.reason === "install") {
    // TODO: Open tab with instructions
    // chrome.tabs.create({
    //   url: 'http://www.dropmark.com/extension/welcome'
    // });
  }
}

function handleMessage(request, sender, callback) {
  if (request.message === 'save_highlights') {
    save(request.highlights);
  }
}

chrome.pageAction.onClicked.addListener(handleActionClick);
chrome.runtime.onMessage.addListener(handleMessage);

if (chrome.runtime.onInstalled)
  chrome.runtime.onInstalled.addListener(handleInstalled);
