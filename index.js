window.addEventListener('mousemove', mouseMove);

// Do not try to translate the last word
let lastWord;

// Track the word under cursor
let wordUnderCursor;

let pattern = new RegExp(/^[\u3131-\uD79D]+$/ugi);

function mouseMove(e) {
    const position = getPosition(e);
    if (!isText(position)) {
        updateWordUnderCursor(null);
        return;
    }

    const text = getText(position);
    const word = getWord(text, getOffset(position));
    updateWordUnderCursor(word);

    if (!shouldTranslateWord(word)) {
        return;
    }
    lastWord = word;

    setTimeout(function () {
        // Only get the translation if the word under cursor is the same as 1 second ago
        if (word === wordUnderCursor) {
            getTranslation(word, {left: e.clientX, top: e.clientY});
        }
    }, 600)
}

function shouldTranslateWord(word) {
    if (word === null) {
        return false;
    }
    if (word === lastWord) {
        return false;
    }
    if (!isKoreanWord(word)) {
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
    if (position.offsetNode === null) {
        return false;
    }
    return position.offsetNode.nodeName === '#text';
}

function getText(position) {
    return position.offsetNode.nodeValue;
}

function getOffset(position) {
    return position.offset;
}

function getWord(text, offset) {
    const words = text.split(' ');
    let length = 0;
    for (let i = 0; i < words.length; i++) {
        length += words[i].length;
        if (length >= offset) {
            return words[i];
        }
        length++; // For the spaces between the words that get removed because we split on spaces
    }

    return null;
}

function getTranslation(word, position) {
    console.log(word);
    setLoadingText(word, position);

    let xhr = new XMLHttpRequest();
    // TODO change after we host it on AWS
    xhr.open('GET', 'http://0.0.0.0:4001/words?korean=eq.' + word + '&select=korean,word_translations(translation, definition)&word_translations.order=id.asc');
    xhr.send(null);
    xhr.onreadystatechange = function () {
        let DONE = 4; // readyState 4 means the request is done.
        let OK = 200; // status 200 is a successful return.
        if (xhr.readyState === DONE) {
            if (xhr.status === OK) {
                const response = JSON.parse(xhr.responseText);
                console.log(response);
                if (response.length === 0) {
                    hidePopOver();

                    return;
                }
                const translation = response[0];
                let text = [];
                text.push(translation.korean); // TODO do not show this, but the related_korean_word
                for (let item of translation.word_translations) {
                    text.push(item.translation); // TODO styling
                    text.push(item.definition);
                }
                setText(word, text.join("\n"), position);
            } else {
                setErrorText(word, position);
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
        div.style.display = 'block';
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

function setLoadingText(word, position) {
    setText(word, 'Loading...', position);
}

function setErrorText(word, position) {
    setText(word, 'Something went wrong fetching the translation...', position);
}

function updateWordUnderCursor(word) {
    if (wordUnderCursor !== word) {
        hidePopOver();
    }

    wordUnderCursor = word;
}

