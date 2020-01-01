let serverUrl = 'ws:localhost:4000/socket';
let popups = [];
let elements = [];

//------------- Talk with background.js ----------------//
function checkIfActiveHandler(response) {
  if (response.active) {
    start();
  }
}

function checkIfActive(closure) {
  browser.runtime.sendMessage({method: 'checkIfActive'}).then(closure);
}

browser.runtime.onMessage.addListener(checkIfActiveHandler);

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
    console.log('Connected to PeraPera Korean', resp)
  })
  .receive('error', resp => {
    console.log('Unable to connect to PeraPera Korean', resp)
  });

//------------- Popup logic ----------------//
function start() {
  document.body.innerHTML = document.body.innerHTML.replace(/([\u3131-\uD79D]+)/ugi, "<span class='perapera-korean'>$1</span>");

  for (let element of document.getElementsByClassName('perapera-korean')) {
    let originalColor = element.style.color;
    let originalBackgroundColor = element.style.color;

    element.onmouseenter = function () {
      let word = element.textContent;

      checkIfActive(function (response) {
        if (!response.active) {
          return;
        }

        channel.push('korean_to_english', {word: word}, 200).receive('ok', function (payload) {
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
            interactive: true,
          });
          popup.show();
          popups.push(popup);
        });
      });
    };

    element.onmouseleave = function () {
      destroyPopupsAndHovers();
    };

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

