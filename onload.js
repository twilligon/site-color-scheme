function keys() {
  const labels = location.hostname.split(".");
  const list = [];

  while (labels.length) {
    list.push(list.length ? `*.${labels.join(".")}` : labels.join("."));
    labels.shift();
  }

  list.push("*");
  return list;
}

function match(candidates) {
  return chrome.storage.sync.get(candidates).then(saved => {
    const key = candidates.find(candidate => candidate in saved);
    return key ? [key, saved[key]] : [];
  });
}

function report() {
  match(keys()).then(([key]) => {
    chrome.runtime.sendMessage([navigator.preferences.colorScheme.value, key]);
  });
}

if (isSecureContext) {
  navigator.preferences.colorScheme.addEventListener("change", report);

  match(keys()).then(([, value]) => {
    if (value) {
      return navigator.preferences.colorScheme.requestOverride(value);
    }
  }).then(report);

  chrome.runtime.onMessage.addListener(message => {
    if (message == "report") {
      report();
    } else {
      match(keys().slice(1)).then(([, fallback]) => {
        const want = navigator.preferences.colorScheme.value == "dark" ? "light" : "dark";
        navigator.preferences.colorScheme.clearOverride();

        const write = (fallback ?? navigator.preferences.colorScheme.value) == want
          ? chrome.storage.sync.remove(location.hostname)
          : chrome.storage.sync.set({ [location.hostname]: want });

        if (navigator.preferences.colorScheme.value != want) {
          navigator.preferences.colorScheme.requestOverride(want);
        }

        write.then(report);
      });
    }
  });
}
