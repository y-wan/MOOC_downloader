chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    chrome.downloads.download({
        url: request.url,
        filename: request.filename
    });
  });