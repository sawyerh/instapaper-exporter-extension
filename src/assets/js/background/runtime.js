let statusInterval;

function save(highlights) {
  let htmlParts = [
    `<html><head>
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
      .roam-export {
        width: 100%;
        font-family: monospace;
      }
    </style>
  </head><body>
  <a href="#html">HTML</a> &bull; <a href="#json">JSON</a> &bull; <a href="#roam">Roam</a>
  <hr />
  Extension by <a href="http://www.sawyerh.com">Sawyer Hollenshead</a>
  <hr />
  <h1 id="html">HTML Export</h1>`
  ];

  highlights.forEach(entry => {
    let part = `<h2><a href="${entry.source}" class="title">${
      entry.title
    }</a></h2>
                <blockquote class="highlight">${entry.highlight}</blockquote>`;
    if (entry.note)
      part += `<small class="note"><strong>Note:</strong> ${
        entry.note
      }</small>`;
    htmlParts.push(part);
  });

  htmlParts.push(
    `<h1 id="json">JSON Export</h1><textarea class="json-export" rows="10">${JSON.stringify(
      highlights
    )}</textarea>`
  );
  htmlParts.push("</body></html>");
  // Roam
  htmlParts.push(
    `<h1 id="roam">Roam Export</h1><textarea class="roam-export" rows="10">`
  );
  const docs = {};
  highlights.forEach(entry => {
    if (!docs[entry.source]) {
      docs[entry.source] = { entry, text: "" };
    }
    if (entry.highlight) {
      let text = "";
      const h = entry.highlight.trim().split(/\n+/);
      if (h.length === 1) {
        text = `  - ${h[0]}`;
      } else {
        text = `  - ${h[0]}\n${h
          .slice(1)
          .map(x => `    - ${x}\n`)
          .join("")}`;
      }
      docs[entry.source].text += `${text}\n${
        entry.note ? `    - ^^${entry.note}^^ #n\n` : ""
      }`;
    } else if (entry.note) {
      docs[entry.source].text += `  - ^^${entry.note}^^ #n`;
    }
  });
  Object.keys(docs).forEach(source => {
    htmlParts.push(
      `- [[${docs[source].entry.title}]] - [link](${
        docs[source].entry.source
      }) #instapaper\n${docs[source].text}`
    );
  });

  htmlParts.push("</textarea></body></html>");

  const blob = new Blob(htmlParts, { type: "text/html" });
  const size = blob.size + 1024 / 2;
  const filename = `instapaper_highlights_export-${Date.now()}.html`;

  // create a blob for writing to a file
  var reqFileSystem =
    window.requestFileSystem || window.webkitRequestFileSystem;
  reqFileSystem(window.TEMPORARY, size, fs => {
    fs.root.getFile(filename, { create: true }, fileEntry => {
      fileEntry.createWriter(fileWriter => {
        fileWriter.onwriteend = openExport.bind(null, filename);
        fileWriter.write(blob);
      });
    });
  });
}

function openExport(filename) {
  let url =
    "filesystem:chrome-extension://" +
    chrome.i18n.getMessage("@@extension_id") +
    "/temporary/" +
    filename;

  chrome.downloads.download({
    filename: filename,
    url: url,
    saveAs: true
  });
}

function sendTabMessage(tab) {
  chrome.tabs.sendMessage(tab.id, { message: "scrape_page" });
}

function handleActionClick(e) {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    let activeTab = tabs[0];

    if (activeTab.url.indexOf("instapaper.com/notes") >= 0) {
      sendTabMessage(activeTab);
    } else {
      chrome.tabs.create(
        { url: "https://instapaper.com/notes" },
        handleNotesTabCreate
      );
    }
  });
}

function handleNotesTabCreate(tab) {
  statusInterval = window.setInterval(() => {
    chrome.tabs.get(tab.id, updatedTab => {
      if (updatedTab.status === "complete") {
        sendTabMessage(tab);
        window.clearInterval(statusInterval);
      }
    });
  }, 100);
}

function handleInstalled(details) {
  if (details.reason === "install") {
    chrome.tabs.create({
      url:
        "https://github.com/sawyerh/instapaper-exporter-extension/blob/master/README.md"
    });
  }
}

function handleMessage(request, sender, callback) {
  if (request.message === "save_highlights") {
    save(request.highlights);
  }
}

chrome.browserAction.onClicked.addListener(handleActionClick);
chrome.runtime.onMessage.addListener(handleMessage);

if (chrome.runtime.onInstalled)
  chrome.runtime.onInstalled.addListener(handleInstalled);
