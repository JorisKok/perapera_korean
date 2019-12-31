let active = false;

browser.browserAction.onClicked.addListener(() => {
  if (active) {
    disable();
  } else {
    activate();
  }
});

function activate() {
  active = true;

  browser.browserAction.setIcon({
    path: {
      16: 'assets/icons/icon-16.png',
      48: 'assets/icons/icon-48.png',
    }
  });

  browser.tabs.query({
    currentWindow: true,
    active: true
  }).then(function (tabs) {
    for (let tab of tabs) {
      browser.tabs.sendMessage(
        tab.id,
        {active: active}
      )
    }
  });
}

function disable() {
  active = false;

  browser.browserAction.setIcon({
    path: {
      16: 'assets/icons/disabled-16.png',
      48: 'assets/icons/disabled-48.png',
    }
  });

}

function checkIfActive(request, sender, sendResponse) {
  switch (request['method']) {
    case 'checkIfActive':
      sendResponse({active: active});
      break;
  }
}

browser.runtime.onMessage.addListener(checkIfActive);
