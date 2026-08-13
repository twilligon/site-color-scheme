if (navigator.preferences?.colorScheme) {
  chrome.tabs.getCurrent().then(tab => chrome.tabs.remove(tab.id));
}

document.title = chrome.i18n.getMessage("extension_name");
document.getElementById("needed").textContent = chrome.i18n.getMessage("setup_spiel_1");

const how = document.getElementById("how");
const anchors = how.querySelectorAll("a");
const [flags, restart] = anchors;
const code = how.querySelector("code");

restart.textContent = chrome.i18n.getMessage("restart_your_browser");

for (const anchor of anchors) {
  anchor.addEventListener("click", event => {
    event.preventDefault();
    chrome.tabs.create({ url: anchor.getAttribute("href") });
  });
}

how.replaceChildren(...chrome.i18n.getMessage("setup_spiel_2", ["\x01", "\x02", "\x03"])
  .split(/([\x01\x02\x03])/)
  .map(part => {
    if (part == "\x01") { return flags; }
    if (part == "\x02") { return code; }
    if (part == "\x03") { return restart; }
    return part;
  }));
