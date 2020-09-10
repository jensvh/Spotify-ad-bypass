
// Communication between content-script and background-script.
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.action === "Mute") {
		chrome.tabs.update(sender.tab.id, {muted: true});
	} else if (request.action == "Unmute") {
		chrome.tabs.update(sender.tab.id, {muted: false});
	}
});