function saveOptions(e) {
  browser.storage.sync.set({
    language: document.querySelector("#language").value
  });
  e.preventDefault();
}

function restoreOptions() {
  let gettingItem = browser.storage.sync.get('language');
  gettingItem.then((res) => {
    document.querySelector("#language").value = res.language || 'english';
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);