async function setup() {
  await chrome.offscreen.createDocument({
    url: "offscreen.html",
    reasons: ["MATCH_MEDIA"],
    justification: "Check whether the Web Preferences API is available"
  });

  if (!await chrome.runtime.sendMessage(null)) {
    chrome.tabs.create({ url: "setup.html" });
  }

  await chrome.offscreen.closeDocument();
}

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason == "install") {
    setup();
  }

  for (const tab of await chrome.tabs.query({})) {
    chrome.tabs.sendMessage(tab.id, "report").catch(() =>
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["onload.js"]
      }).catch(error => console.warn(error)));
  }
});

chrome.action.onClicked.addListener(tab => {
  chrome.tabs.sendMessage(tab.id, "toggle").catch(error => {
    console.error(error);
    setup();
  });
});

function circle(name) {
  const context = new OffscreenCanvas(32, 32).getContext("2d");

  context.fillStyle = { light: "#e5e5e5", dark: "#1a1a1a", unknown: "#808080" }[name];
  context.arc(16, 16, 16, 0, 2 * Math.PI);
  context.fill();
  return context.getImageData(0, 0, 32, 32);
}

function show(tabId, icon, title) {
  chrome.action.setIcon({ tabId, imageData: circle(icon) }).catch(() => {});
  chrome.action.setTitle({ tabId, title }).catch(() => {});
}

chrome.action.setIcon({ imageData: circle("unknown") });

chrome.runtime.onMessage.addListener(([value, key], sender) => {
  const kind = !key ? "default"
    : key == new URL(sender.url).hostname ? "override"
    : "pattern";

  show(sender.tab.id, value, chrome.i18n.getMessage(`${value}_${kind}`, key));
});

chrome.tabs.onUpdated.addListener((tabId, change) => {
  if (change.status == "complete") {
    chrome.tabs.sendMessage(tabId, "report").catch(error => {
      show(tabId, "unknown", chrome.i18n.getMessage("not_available"));
      console.warn(error);
    });
  }
});
