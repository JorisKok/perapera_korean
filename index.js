// Do not try to translate the last word
let lastWord;

// On select text
document.onmouseup = document.onkeyup = function (e) {

    let word = getSelectionText();

    if (!word) {
        return;
    }

    if (word === lastWord) {
        return;
    }

    if (!e.clientX || !e.clientY) {
        return;
    }

    lastWord = word;

    getTranslation(word, {left: e.clientX, top: e.clientY});
};

document.onclick = function (e) {
    hidePopOver();

    // Reset the last word
    lastWord = null;
};

function getSelectionText() {
    let activeEl = document.activeElement;
    let activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
    if (activeElTagName === "textarea" || (activeElTagName === "input" && /^(?:text|search|password|tel|url)$/i.test(activeEl.type)) && typeof activeEl.selectionStart == "number") {
        return activeEl.value.slice(activeEl.selectionStart, activeEl.selectionEnd);
    } else if (window.getSelection) {
        return window.getSelection().toString();
    }
    return null;
}

function getTranslation(word, position) {
    setLoadingText(word, position);

    let xhr = new XMLHttpRequest();
    // TODO change after we host it on AWS
    xhr.open('GET', 'http://0.0.0.0:4001/words?korean=eq.' + word + '&select=korean,word_translations(related_korean_word,translation, definition)&word_translations.order=id.asc');
    xhr.setRequestHeader('Range', '1');
    xhr.send(null);
    xhr.onreadystatechange = function () {
        let DONE = 4; // readyState 4 means the request is done.
        let OK = 200; // status 200 is a successful return.
        if (xhr.readyState === DONE) {
            if (xhr.status === OK) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (response.length === 0) {
                        hidePopOver();

                        return;
                    }
                    const translation = response[0];
                    let text = '';
                    for (let item of translation.word_translations.slice(0, 5)) {
                        text += '<span style="font-weight: bold; color: #4982de; font-size: 16px; margin-right: 6px;">' + item.related_korean_word + '</span>';
                        text += '<span style="font-weight: bold;">' + item.translation.replace(';', ',') + '</span>';
                        text += '<p style="margin-bottom: 1rem;">' + item.definition + '</p>';
                    }
                    setText(word, text, position);
                } catch (error) {
                    setErrorText(word, position);
                }
            } else {
                setErrorText(word, position);
            }
        }
    };
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
        div.innerHTML = '';
        return div.style.display = 'none';
    }
}

function setPopOverPosition(popover, position) {
    popover.style.left = position.left + 10 + 'px';
    popover.style.top = (position.top + 14 + getScrollHeight()) + 'px';

    return popover;
}

function setText(word, text, position) {
    if (selectionChanged(word)) {
        hidePopOver();
        return;
    }
    let popover = setPopOverPosition(getOrCreatePopOver(), position);
    popover.innerHTML = text;
    document.body.appendChild(popover);
}

function selectionChanged(word) {
    return word !== getSelectionText();
}


function setLoadingText(word, position) {
    // Only show the loading text when after a small interval
    // Because else the loading screen appears, and instantly the ajax request is done, which looks bad
    // So wait a bit, and see if it actually has to call the KRDict (which takes long)
    setTimeout(function () {
        let element = getOrCreatePopOver();
        if (element.innerHTML === '') {
            let popover = setPopOverPosition(element, position);
            popover.innerHTML = 'Loading...';
            document.body.appendChild(popover);
        }
    }, 300);
}

function setErrorText(word, position) {
    setText(word, 'Could not translate...', position);
}


function getScrollHeight() {
    return window.scrollY || window.pageYOffset || document.body.scrollTop + (document.documentElement && document.documentElement.scrollTop || 0);
}

