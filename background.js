let active = false;

chrome.browserAction.onClicked.addListener(() => {
  if (active) {
    disable();
  } else {
    activate();
  }
});

function activate() {
  active = true;

  chrome.browserAction.setIcon({
    path: {
      16: 'assets/icons/icon-16.png',
      48: 'assets/icons/icon-48.png',
    }
  });

  chrome.tabs.query({
    currentWindow: true,
    active: true
  }, function (tabs) {
    for (let tab of tabs) {
      chrome.tabs.sendMessage(
        tab.id,
        {active: active}
      )
    }
  });
}

function disable() {
  active = false;

  chrome.browserAction.setIcon({
    path: {
      16: 'assets/icons/disabled-16.png',
      48: 'assets/icons/disabled-48.png',
    }
  });

}

function receiveMessage(request, sender, sendResponse) {
  switch (request['method']) {
    case 'checkIfActive':
      sendResponse({active: active});
      break;
  }
}

chrome.runtime.onMessage.addListener(receiveMessage);
