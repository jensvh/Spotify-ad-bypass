// Communication between content-script and background-script.
var tab_id = null;
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	switch(request.action) {
		case 'onAd':
			// start to play the media element, and mute the tab
			mediaElement.play();
			mute(sender.tab.id);
			tab_id = sender.tab.id;
			break;
		case 'onTrack':
			console.log("ontrack");
			onTrack();
			tab_id = sender.tab.id;
			break;
		case 'onAdFinished':
			// for now nothing needs to happen here
			break;
		default:
			break;
	}
});

mediaElement.onended = function() {
	console.log("ontrackended");
	communicate('onMediaElementFinished');
	unmute(tab_id);
};

async function onTrack() {
	// check context for next ad and buffer
	const context = await getUserPlayback();
	const ad_index = getAdIndex(context);
	console.log("Ad index: " + ad_index);
	const track = getTrackByIndex(context, ad_index+1); // This does not return a track object, it just contains a song uri and some useless information
	if (buffered_track !== track.uri) {
		buffered_track = track.uri
		const track_obj = await getTrackObj(track);
		const yt_id = await getBestMatch(track_obj);
		const url = await getDownloadUrl(yt_id);
		changeTrack(url);
	}
}


// -------------------- utils ---------------------
async function communicate(action) {
	await chrome.tabs.sendMessage(tab_id, {action: action});
}

async function mute(id) {
	chrome.tabs.update(id, {muted: true});
}

async function unmute(id) {
	chrome.tabs.update(id, {muted: false});
}