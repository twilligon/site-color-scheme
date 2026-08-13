chrome.runtime.onMessage.addListener((message, sender, respond) => {
  respond(!!navigator.preferences?.colorScheme)
});
