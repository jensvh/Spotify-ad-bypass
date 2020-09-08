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

// Default value
var reload_after_x_tracks = 5;
var tracks_played = 0;
// Observe the track name for a mutation => a new track (or ad) is played.
async function blockAdds(track_name) {
	new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			tracks_played++;
			console.log("tracks: " + tracks_played + ":" + reload_after_x_tracks);
			if (tracks_played > reload_after_x_tracks) {
				window.location.reload(false);
			}
		});
	}).observe(track_name, { attributeFilter: ['aria-label']});
}

// Press the play button
async function play() {
	var btn = document.querySelector('button[data-testid="control-button-play"]');
	btn.click();
}

// Retrieve "how many tracks, before a reload" from storage.
chrome.storage.local.get("tracks_before_reload", function(data) {
	reload_after_x_tracks = data.tracks_before_reload;
});

// Ad bypass logic
onSpotifyLoaded()
		.then(track_name => {
			play();
			blockAdds(track_name);
		});