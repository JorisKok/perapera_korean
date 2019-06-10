window.addEventListener('mousemove', mouseMove);

// Do not try to translate the last word
let lastWord;

let pattern = new RegExp(/^[\u3131-\uD79D]+$/ugi);

function mouseMove(e) {
    const position = getPosition(e);
    if (! isText(position)) {
        return;
    }

    const text = getText(position);
    const word = getWord(text, getOffset(position));
    if (! shouldTranslateWord(word)) {
        return;
    }
    lastWord = word;

    getTranslation(word, {left: e.clientX, top: e.clientY});

}

function shouldTranslateWord(word) {
    if (word === null) {
        return false;
    }
    if (word === lastWord) {
        return false;
    }
    if (! isKoreanWord(word)) {
        return false;
    }

    return true;
}

function getPosition(e) {
    if (document.caretPositionFromPoint) {
            return document.caretPositionFromPoint(e.clientX, e.clientY);
    }
    if (document.caretRangeFromPoint) {
        return document.caretRangeFromPoint(e.clientX, e.clientY);
    }
}

function isText(position) {
    return position.offsetNode.nodeName === '#text';
}

function getText(position) {
    return position.offsetNode.nodeValue;
}

function getOffset(position) {
    return position.offset;
}

function getElementOffset( el ) {
    var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return { top: _y, left: _x };
}

function getWord(text, offset) {
    const words = text.split(' ');
    let result = [];
    let length = 0;
    for (let i = 0; i < words.length; i++){
        length += words[i].length;
        if (length >= offset) {
            return words[i];
        }
        length ++; // For the spaces between the words that get removed because we split on spaces
    }

    return null;
}

function getElement(position) {
    return position.offsetNode.parentElement;
}

function getTranslation(word, position) {
    console.log(word);
    let xhr = new XMLHttpRequest();
    // TODO change after we host it on AWS
    xhr.open('GET', 'http://0.0.0.0:3000/words?korean=eq.' + word + '&select=korean%2Cword_translations(translation, definition)');

    xhr.send(null);
    xhr.onreadystatechange = function () {
      let DONE = 4; // readyState 4 means the request is done.
      let OK = 200; // status 200 is a successful return.
      if (xhr.readyState === DONE) {
        if (xhr.status === OK) {
          const response = JSON.parse(xhr.responseText);
          if (response.length === 0) {
            hidePopOver();

            return;
          }
          const translation = response[0];
          console.log(translation);
          let text = [];
          text.push(translation.korean);
          for (let item of translation.word_translations) {
            text.push(item.translation + " - " + item.definition);
          }
          setText(word, text.join("\n"), position);
        } else {
          console.log('Error: ' + xhr.status); // An error occurred during the request.
        }
      }
    };
}

function isKoreanWord(word) {
    return pattern.test(word);
}

function getOrCreatePopOver() {
  let div = document.getElementById('perapera-window');
  if (div) {
    return div;
  }

  div = document.createElement('div');
  div.id = 'perapera-window';

  return div;
}

function hidePopOver() {
  let div = document.getElementById('perapera-window');
  if (div) {
    return div.style.display = 'none';
  }
}

function setPopOverPosition(popover, position) {
  popover.style.left = position.left + 'px';
  popover.style.top = (position.top + 8) + 'px';

  return popover;
}

function setText(word, text, position) {
  let popover = setPopOverPosition(getOrCreatePopOver(), position);
  popover.innerText = text;
  document.body.appendChild(popover);
}

