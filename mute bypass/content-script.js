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
			console.log(mutation);
			
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

// Press the play/pause button
async function pause() {
	var btn = document.querySelector('button[data-testid="control-button-play"]');
	btn.click();
}

async function mute() {
	await chrome.runtime.sendMessage({action: 'Mute'});
}

async function unmute() {
	await chrome.runtime.sendMessage({action: 'Unmute'});
}

let wasAd = false;
async function onAd() {
	wasAd = true;
	mute();
}

async function onTrack() {
	if (wasAd) {
		unmute();
		wasAd = false;
		pause();
	}
}

// Ad bypass logic
onSpotifyLoaded()
		.then(track_name => {
			observeTrackName(track_name);
		});