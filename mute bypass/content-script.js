// Ad bypass logic
onSpotifyLoaded()
		.then(track_name => {
			observeTrackName(track_name);
		});

var wasAd = false;

async function onAd() {
	wasAd = true;
	communicate('onAd');
}

async function onTrack() {
	if (wasAd) {
		console.log("was ad");
		wasAd = false;
		communicate('onAdFinished');
		setTimeout(pause, 150);
		return;
	}
	communicate('onTrack');
}

// Communication listener
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.action == 'onMediaElementFinished') {
		console.log("onMediaElementFinished");
		nextTrack();
		play();
	}
});


// ----------------- utils ---------------------
// when spotify is fully loaded
// Check every 250ms if "track name" element exists, when it exists, spotify is fully loaded
async function onSpotifyLoaded() {
	return new Promise((resolve) => {
		const interval_id = setInterval(function() {
			const track_name = document.querySelector('.now-playing');
			
			if (track_name !== null) {
				clearInterval(interval_id);
				resolve(track_name);
			}
		}, 250);
	});
}

// Observe the track name for a mutation => a new track (or ad) is played.
async function observeTrackName(track_name) {
	new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			
			// If is add
			if (mutation.target.innerText === "" || mutation.target.innerText.includes("Advertisement")) {
				console.log("ad");
				onAd();
			} else {
				console.log("track");
				onTrack();
			}
			
		});
	}).observe(track_name, { attributeFilter: ['aria-label']});
}

// Press the pause button
async function pause() {
	console.log("pause");
	var btn = document.querySelector('button[data-testid="control-button-pause"]');
	if (btn !== null && btn !== undefined) {
		console.log("click");
		btn.click();
	}
}

// Press the play button
async function play() {
	var btn = document.querySelector('button[data-testid="control-button-play"]');
	if (btn !== null && btn !== undefined) {
		btn.click();
	}
}

// Press the next button
async function nextTrack() {
	var btn = document.querySelector('button[data-testid="control-button-skip-forward"]');
	btn.click();
}

async function communicate(action) {
	await chrome.runtime.sendMessage({action: action});
}