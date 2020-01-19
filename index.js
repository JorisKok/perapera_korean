let serverUrl = 'wss://insidious-dodgerblue-fairybluebird.gigalixirapp.com/socket';
let popups = [];
let elements = [];
let timer;

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
  createSpans(document.getElementsByTagName("div"));
  createSpans(document.getElementsByTagName("p"));
  createSpans(document.getElementsByTagName("a"));
  createSpans(document.getElementsByTagName("li"));
  createSpans(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
  // document.body.innerHTML = document.body.innerHTML.replace(/([\u3131-\uD79D]+)/ugi, "<span class='perapera-korean' title=''>$1</span>");

  for (let element of document.getElementsByClassName('perapera-korean')) {
    let originalColor = element.style.color;
    let originalBackgroundColor = element.style.color;

    element.onmouseenter = function () {
      // Prevent popups when moving quickly over text
      timer = setTimeout(function () {
        createPopup();
      }, 80);
    };

    element.onmouseleave = function () {
      clearTimeout(timer);
      destroyPopupsAndHovers();
    };

    function createPopup() {
      let word = element.textContent;

      checkIfActive(function (response) {
        if (!response.active) {
          return;
        }

        channel.push('korean_to_english', {word: word}, 2000).receive('ok', function (payload) {
          destroyPopupsAndHovers();

          let content = '';
          for (let translations of payload.translations) {
            for (let translation of translations) {
              content += `${translation}<br>`;
            }
          }

          if (content === '') {
            content = 'No translation found';
          }

          elements.push(element);
          element.style.color = 'white';
          element.style.backgroundColor = 'black';

          let popup = tippy(element, {
            placement: 'top-start',
            content: content,
            appendTo: document.body,
            onHidden() {
              destroyPopupsAndHovers();
            }
          });
          popup.show();
          popups.push(popup);
        });
      });
    }

    function destroyPopupsAndHovers() {
      // Prevent text to stay black
      for (let el of elements) {
        el.style.color = originalColor;
        el.style.backgroundColor = originalBackgroundColor;
      }

      // Prevent popups to hang
      for (let po of popups) {
        po.destroy();
      }

      popups = [];
      elements = [];
    }
  }
}

function createSpans(elements) {
  for (let element of elements) {
    if (element === undefined) {
      continue;
    }

    if (element.innerHTML.includes('perapera-korean')) {
      continue;
    }

    element.innerHTML = element.innerHTML.replace(/([\u3131-\uD79D]+)/ugi, "<span class='perapera-korean' title=''>$1</span>");
  }
}
