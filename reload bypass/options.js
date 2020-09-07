// When save button is clicked, save value
document.getElementById("tracks").onclick = function() {
	var tracks_before_reload = document.getElementById("tracks_before_reload");
	const value = tracks_before_reload.value;
	
	// Filter wrong values
	if (parseInt(value) === undefined ||parseInt(value) === null || value < 0 || value > 999) {
		document.getElementById("answer").innerText = "Wrong value, please enter a number greater than 0 and smaller than 999.";
		return;
	}
	// Store value
	chrome.storage.local.set({tracks_before_reload: value}, function() {
		var div = document.getElementById("answer");
		div.innerText = "Saved";
	});
};

// When backup button pressed, create a backup from the backgroundScript
document.getElementById("backup").onclick = function() {
	chrome.extension.getBackgroundPage().backupData();
};

// get current value of "tracks_before_reload" and set as value of tracks
chrome.storage.local.get("tracks_before_reload", function(data) {
	if (data.tracks_before_reload) {
		document.getElementById("tracks_before_reload").value = data.tracks_before_reload;
	}
});