// YtMusic tokens
const music_api_token = 'Eg-KAQwIARAAGAAgACgAMABqChADEAQQCRAFEAo%3D';
const video_api_token = 'Eg-KAQwIABABGAAgACgAMABqChADEAQQCRAFEAo%3D';

// Send a search request
async function sendRequest(search_query, token) {
	// Retrieving data
	const response = await fetch('https://music.youtube.com/youtubei/v1/search?alt=json&key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30', {
		method: 'POST',
		mode: 'no-cors',
		cache: 'no-cache',
		credentials: 'omit',
		headers: {
			'Content-Type': 'application/json; charset=UTF-8',
			'referrer': 'https://music.youtube.com/search'
		},
		body: "{\"context\":{\"client\":{\"clientName\":\"WEB_REMIX\",\"clientVersion\":\"0.1\"}},\"query\":\"" + search_query + "\",\"params\":\"" + token + "\"}"
	}).catch((error) => {console.log("error");console.log(error);});
	return response.json();
}

// Get the parent json element of all songs
function getMusicShelfRendererContents(json) {
	const array = json.contents.sectionListRenderer.contents;
	for (var i = 0; i < array.length; i++) {
		if (array[i].musicShelfRenderer !== undefined && array[i].musicShelfRenderer !== null) {
			return array[i].musicShelfRenderer.contents;
		}
	}
	return undefined;
}

// Turn the weird youtube json to a much more readable json
function getTrack(musicShelfRendererContent) {
	const track_parent = musicShelfRendererContent.musicResponsiveListItemRenderer.flexColumns;
	var track = {artists: []}; // Setup empty track
	
	// Get track name
	track.name = stripString(track_parent[0].musicResponsiveListItemFlexColumnRenderer.text.runs[0].text);
	// Get artists
	const artists_parent = track_parent[1].musicResponsiveListItemFlexColumnRenderer.text.runs;
	for (var i = 0; i < artists_parent.length; i++) {
		if (artists_parent[i].navigationEndpoint !== undefined && artists_parent[i].navigationEndpoint !== null) { // => filters artists from (& , and ...)
			track.artists.push(stripString(artists_parent[i].text));
		}
	}
	// Get album (in some case's the album is replaced by the title)
	track.album = stripString(track_parent[2].musicResponsiveListItemFlexColumnRenderer.text.runs[0].text);
	// Get duration
	const duration = track_parent[3].musicResponsiveListItemFlexColumnRenderer.text.runs[0].text.split(':'); // Is in format mm:ss, so split at ':'
	track.duration = (parseInt(duration[0]) * 60 + parseInt(duration[1])) * 1000; // You might wanna check if the time is in hours (=> hh:mm:ss), 
	// Get track id
	track.id = musicShelfRendererContent.musicResponsiveListItemRenderer.doubleTapCommand.watchEndpoint.videoId;
	
	return track;
}

// Strip everything in brackets from a string, also remove special chars and return everything in lower case
// By doing so we can find better similarities between tracks
function stripString(string) {
	// No idea how it works, but is does the trick.
	return string.replace(/\(.*\)/, '').replace(/[^a-zA-Z0-9]/g, '').trim().toLowerCase();
}

// Change origin of request to Youtube music, otherwise youtube will return a 403 (Forbidden)
chrome.webRequest.onBeforeSendHeaders.addListener(function(details){
  details.requestHeaders.some(function(header){
      if( header.name == 'Origin' ) {
          header.value = 'https://music.youtube.com/';
          return true;
      }
      return false;
  });
  return {requestHeaders: details.requestHeaders};
}, {urls: [ '*://music.youtube.com/*' ]},['requestHeaders','blocking','extraHeaders']);

// Get download link for mp3
function getDownloadUrl(id) {
	return fetch('https://www.yt-download.org/api/button/mp3/' + id)
		.then(response => response.text())
		.then(text => {
			const html = new DOMParser().parseFromString(text, 'text/html');
			const download_link = html.documentElement.querySelector('div.download > a').href;
			return download_link;
		})
		.catch(error => {
			console.log(error);
			return null;
		});
}

// Find best match with spotify track
async function getBestMatch(track) {
	// Track info, make ready for comparison
	const name = stripString(track.name);
	const artist = stripString(track.artists[0].name);
	const album = stripString(track.album.name);
	const duration = parseInt(track.duration_ms); // in ms
	
	var json = await sendRequest(track.name + " " + track.artists[0].name, music_api_token);
	var contents = getMusicShelfRendererContents(json);
	
	// For each track in contents
	for (var i = 0; i < contents.length; i++) {
		// Make the track a bit more readable
		const track = getTrack(contents[i]);
		// check matching criteria
		if (name.includes(track.name) && (album.includes(track.album) || album.includes(track.name)) && Math.abs(duration - track.duration) <= 2000) {
			// Check if artists match
			for (var j = 0; j < track.artists.length; j++) {
				if (artist.includes(track.artists[i])) {
					console.log("Found a match: " + track.name);
					return track.id;
				}
			}
		}
	}
	
	json = await sendRequest(track.name + " " + track.artists[0].name, video_api_token);
	contents = getMusicShelfRendererContents(json);
	
	// For each track in contents
	for (var i = 0; i < contents.length; i++) {
		// Make the track a bit more readable
		const track = getTrack(contents[i]);
		// check matching criteria
		if (name.includes(track.name) && (album.includes(track.album) || album.includes(track.name)) && Math.abs(duration - track.duration) <= 2000) {
			// Check if artists match
			for (var j = 0; j < track.artists.length; j++) {
				if (artist.includes(track.artists[i])) {
					console.log("found a match: " + track.name);
					return track.id;
				}
			}
		}
	}
	console.log("Could not find a suitable match");
	return undefined;
}