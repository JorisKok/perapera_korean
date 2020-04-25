let serverUrl = 'wss://insidious-dodgerblue-fairybluebird.gigalixirapp.com/socket';
let popups = [];
let lastWord;

//------------- Talk with background.js ----------------//
function checkIfActiveHandler(response) {
  if (response.active) {
    if (canStart()) {
      start();
    }
  }
}

function canStart() {
  // Make sure the dom has not been edited before
  return document.getElementsByClassName('perapera-korean').length === 0
}

function checkIfActive(closure) {
  chrome.runtime.sendMessage({method: 'checkIfActive'}, closure);
}

// chrome.runtime.onMessage.addListener(checkIfActiveHandler);
chrome.runtime.onMessage.addListener(function (response) {
  checkIfActive(checkIfActiveHandler);
});

checkIfActive(checkIfActiveHandler);


//-------------------- Websocket -----------------------//
let socket = new Socket(serverUrl, {});
socket.connect();

guid = ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
  (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
);

let channel = socket.channel(`dictionary:${guid}`, {});
channel.join()
  .receive('ok', resp => {
    console.log('Connected to PeraPera Korean');
  })
  .receive('error', resp => {
    console.log('Unable to connect to PeraPera Korean')
  });

//------------- Popup logic ----------------//
function start() {
  document.addEventListener('selectionchange', () => {
    let selection = window.getSelection();
    let word = selection.toString();
    if (! word) {
      for (let po of popups) {
        po.destroy();
      }
      return;
    }

    if (lastWord === word) {
      return;
    }

    lastWord = word;

    let span = document.createElement("span");
    span.innerText = word;
    selection.getRangeAt(0).deleteContents();
    selection.getRangeAt(0).insertNode(span)

    channel.push('korean_to_english', {word: word}, 2000).receive('ok', function (payload) {
      let content = '';
      for (let translations of payload.translations) {
        for (let translation of translations) {
          content += `${translation}<br>`;
        }
      }

      if (content === '') {
        content = 'No translation found';
      }

      let popup = tippy(span, {
        content: content,
        showOnCreate: true,
        interactive: true,
        onHide() {
          return false;
        },
      });

      popup.show();
      popups.push(popup);
    });
  });
}

