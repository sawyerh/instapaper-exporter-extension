'use strict';
import $ from 'jquery';
let highlights = [];

function scrapePage(parent, callback) {
  let articles = parent.querySelectorAll('.articles .highlight_item');
  let nextPage = parent.querySelector('.paginate_older');

  for (var i = 0; i < articles.length; i++) {
    let article = articles[i];
    let textNode = article.querySelector('.js_highlight_text');
    let noteNode = article.querySelector('.highlight_comment .comment_text');
    highlights.push({
      highlight: textNode.textContent,
      note: noteNode ? noteNode.textContent : null
    });
  }

  if (nextPage) {
    scrapeNextPage(nextPage.getAttribute('href'), callback);
  } else {
    console.log('callback', highlights);
    callback(highlights);
  }
}

function scrapeNextPage(url, callback) {
  let $box = $('<div />');
  $box.load(`${url} #main_content`, () => {
    scrapePage($box.get(0), callback);
  });
}

function handleExtensionMessage(request, sender, callback) {
  if (request.message === 'scrape_page')
    scrapePage(document, callback);
}

chrome.runtime.onMessage.addListener(handleExtensionMessage);