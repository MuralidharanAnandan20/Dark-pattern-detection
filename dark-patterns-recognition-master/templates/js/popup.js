  window.onload = function () {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      if (tabs && tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { message: "popup_open" });
      }
    });

    let analyzeButton = document.getElementsByClassName("analyze-button")[0];
    if (analyzeButton) {
      analyzeButton.onclick = function () {
        chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
          if (tabs && tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { message: "analyze_site" });
          }
        });
      };
    }

    let link = document.getElementsByClassName("link")[0];
    if (link) {
      link.onclick = function () {
        chrome.tabs.create({ url: link.getAttribute("href") });
      };
    }
  };

  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message === "update_current_count") {
      document.getElementsByClassName("number")[0].textContent = request.count;
    }
  });
