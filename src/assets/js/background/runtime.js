function save(highlights) {
  let htmlParts = [`<html><head>
    <meta charset="utf-8">
    <title>Instapaper Highlights Export</title>
    <style type="text/css">
      body {
        max-width: 800px;
        margin: 50px auto;
        line-height: 1.4;
      }
      h1 {
        margin: 50px 0 1em;
      }
      h2 {
        font-size: 1em;
        font-weight: normal;
        margin: 3em 0 1em;
      }
      blockquote {
        background: #FFFCEE;
        padding: 15px;
        margin: 0 0 10px;
        display: block;
        font-size: 1.2em;
      }
      code {
        background: #F7F7F7;
        padding: 10px;
      }
      .json-export {
        width: 100%;
        font-family: monospace;
      }
    </style>
  </head><body>
  <a href="#html">HTML</a> &bull; <a href="#json">JSON</a>
  <hr />
  Extension by <a href="http://www.sawyerh.com">Sawyer Hollenshead</a>
  <hr />
  <h1 id="html">HTML Export</h1>`];

  highlights.forEach(entry => {
    let part = `<h2><a href="${entry.source}" class="title">${entry.title}</a></h2>
                <blockquote class="highlight">${entry.highlight}</blockquote>`;
    if (entry.note) part += `<small class="note"><strong>Note:</strong> ${entry.note}</small>`;
    htmlParts.push(part);
  });

  htmlParts.push(`<h1 id="json">JSON Export</h1><textarea class="json-export" rows="10">${JSON.stringify(highlights)}</textarea>`);
  htmlParts.push('</body></html>');

  const blob = new Blob(htmlParts, {type: "text/html"});
  const size = blob.size + (1024 / 2);
  const filename = `instapaper_highlights_export-${Date.now()}.html`;

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
