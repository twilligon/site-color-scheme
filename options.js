const overrides = document.getElementById("overrides");
const pattern = document.getElementById("pattern");
const value = document.getElementById("value");

function normalize(text) {
  if (!text.includes("*")) {
    return text;
  }

  const tail = text.slice(text.lastIndexOf("*") + 1).replace(/^\./, "");
  return tail ? `*.${tail}` : "*";
}

function render() {
  chrome.storage.sync.get(null).then(saved => {
    overrides.replaceChildren(...Object.keys(saved).sort().map(key => {
      const row = document.createElement("div");
      const name = document.createElement("span");
      const remove = document.createElement("button");

      name.textContent = key;
      remove.textContent = "×";
      remove.addEventListener("click", () => chrome.storage.sync.remove(key));

      row.append(name, chrome.i18n.getMessage(saved[key]), remove);
      return row;
    }));
  });
}

for (const option of value.options) {
  option.textContent = chrome.i18n.getMessage(option.value);
}

document.getElementById("add").addEventListener("submit", event => {
  event.preventDefault();
  chrome.storage.sync.set({ [normalize(pattern.value)]: value.value });
  pattern.value = "";
});

chrome.storage.onChanged.addListener(render);
render();
