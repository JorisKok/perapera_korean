let serverUrl = 'wss://insidious-dodgerblue-fairybluebird.gigalixirapp.com/socket';
let popups = [];
let spans = [];
let lastWord;
let language = 'english';


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


// ------------------- Options ------------------------- //
browser.storage.sync.get('language').then(res => {
  language = res.language || 'english';
})

// ------------------- Popup logic --------------------- //
function start() {
  document.addEventListener('selectionchange', () => {
    let selection = window.getSelection();
    let word = selection.toString();
    console.log(selection);
    console.log(word);
    if (!word) {
      destroyPopups();
      destroySpans();
      lastWord = null;
      return;
    }

    if (lastWord === word) {
      return;
    }

    lastWord = word;

    // Create a span around the selection
    let span = document.createElement("span");
    selection.getRangeAt(0).surroundContents(span);
    spans.push(span)

    // TODO change url
    fetch(`http://localhost:4000/translate/${word}`)
      .then(response => {
        return response.json();
      })
      .then(translations => {
        destroyPopups();

        let content = '';
        for (let translation of translations) {
          let word = translation['word'];
          for (let item of translation[language]) {
            if (language === 'korean') {
              content += `<p class="perapera">`
              content += `<span class="perapera_word">${word}</span><br/>`;
              content += `<span class="perapera_definition">${sanitize(item.translation)}</span></br>`;
              content += `</p>`
            }

            if (language === 'english') {
              content += `<p class="perapera">`
              content += `<span class="perapera_word">${word}</span>`;
              content += `<span class="perapera_spacer">-</span>`
              content += `<span class="perapera_translation">${sanitize(item.translation)}</span></br>`;
              if (item.definition) {
                content += `<span class="perapera_definition">${sanitize(item.definition)}</span></br>`;
              }
              content += `</p>`
            }
          }
        }

        let p = tippy(span, {
          content: content ? content : 'No translation found',
          showOnCreate: true,
          interactive: true,
          allowHTML: true,
          onHide() {
            return false;
          },
          onDestroy() {
            return false;
          }
        });

        p.show();
        popups.push(p);
      });
  });
}

function destroyPopups() {
  for (let popup of popups) {
    popup.destroy();
  }
}

function destroySpans() {
  for (let span of spans) {
    span.destroy();
  }
}

function sanitize(input) {
  let tmp = document.createElement('div');
  tmp.textContent = input;
  return tmp.innerHTML;
}
