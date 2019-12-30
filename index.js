let socket = new Socket('ws:localhost:4000/socket', {});
socket.connect();

let guid = generateUuid();
let popup;

function generateUuid() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

let channel = socket.channel(`dictionary:${guid}`, {});
channel.join()
  .receive("ok", resp => {
    console.log("Joined successfully", resp)
  })
  .receive("error", resp => {
    console.log("Unable to join", resp)
  })

window.onload = function () {
  console.log('Loaded');

  for (let element of document.getElementsByTagName('P')) {
    element.innerHTML = element.innerHTML.replace(/([\u3131-\uD79D]+)/ugi, "<span class='perapera-korean'>$1</span>");
  }

  for (let element of document.getElementsByClassName('perapera-korean')) {
    let originalColor = element.style.color;
    let originalBackgroundColor = element.style.color;
    // let word = element.innerText;

    element.onmouseenter = function () {
      console.log('Entered'); // TODO remove

      element.style.color = 'white';
      element.style.backgroundColor = 'black';
      let word = element.textContent;

      popup = tippy(element, {
        placement: 'top-start',
        content: "",
        interactive: true,
      });

      channel.push('korean_to_english', {word: word});
      channel.on('korean_to_english', function (result) {
        console.log(result.translations);
        let content = "";
        for (let translations of result.translations) {
          for (let translation of translations) {
            content += `${translation}<br>`;
          }
        }

        popup.setContent(content);
        popup.show();
      });

    };

    element.onmouseleave = function () {
      element.style.color = originalColor;
      element.style.backgroundColor = originalBackgroundColor;
      popup.destroy();
    };
  }

  // console.log();
  // tippy(all, {
  //   content: 'OMG'
  // });
};
