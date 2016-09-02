'use strict';
import $ from 'jquery';
let highlights = [];

function scrapePage(parent) {
  let articles = parent.querySelectorAll('.articles .highlight_item');
  let nextPage = parent.querySelector('.paginate_older');

  for (var i = 0; i < articles.length; i++) {
    let article = articles[i];
    let titleNode = article.querySelector('.article_title');
    let textNode = article.querySelector('.js_highlight_text');
    let noteNode = article.querySelector('.highlight_comment .comment_text');
    let linkNode = article.querySelector('.host .js_domain_linkout');

    highlights.push({
      title: titleNode.textContent.trim(),
      highlight: textNode.textContent.trim(),
      note: noteNode ? noteNode.textContent.trim() : null,
      source: linkNode ? linkNode.getAttribute('href') : null
    });
  }

  if (nextPage) {
    scrapeNextPage(nextPage.getAttribute('href'));
  } else {
    console.log('callback', highlights);
    sendHighlights(highlights);
  }
}

function scrapeNextPage(url) {
  let $box = $('<div />');
  $box.load(`${url} #main_content`, () => {
    scrapePage($box.get(0));
  });
}

function sendHighlights(highlights) {
  chrome.runtime.sendMessage(chrome.i18n.getMessage('@@extension_id'), {
    message: 'save_highlights',
    highlights: highlights
  });
}

function handleExtensionMessage(request) {
  if (request.message === 'scrape_page')
    scrapePage(document);
}

chrome.runtime.onMessage.addListener(handleExtensionMessage);