// get bearer, needed for calling the spotify api
var bearer = null;
chrome.webRequest.onCompleted.addListener(
	function(details) {
		bearer = details.url.split("=")[1];
	}, {urls: ["wss://gew-dealer.spotify.com/*"]}
);

// Get device_id and connection_id
var device_id = null;
var connection_id = null;
chrome.webRequest.onBeforeRequest.addListener(
	function(details) {
		if (details.method === "POST") {
			// The data is already encoded in bytes, so we need to decode it again
			var json = JSON.parse(decodeURIComponent(String.fromCharCode.apply(null, new Uint8Array(details.requestBody.raw[0].bytes))));

			device_id = json.device.device_id;
			connection_id = json.connection_id;
			
			console.log("Device and connection id are updated.");
		}
	}, {urls: ["https://gew-spclient.spotify.com/track-playback/v1/devices"]}, ["requestBody"]
);

// get user's playback, this includes all upcoming tracks(queue), it also shows when an ad is going to be played.
async function getUserPlayback() {
	var response = await fetch('https://gew-spclient.spotify.com/connect-state/v1/devices/hobs_' + device_id.substring(0, device_id.length - 5),
		{method: 'PUT',
		cache: 'no-cache',
		credentials: 'omit',
		headers: {
			'Content-Type': 'text/plain;charset=UTF-8',
			'Referrer': 'https://open.spotify.com/queue',
			'Connection': 'close',
			'x-spotify-connection-id': connection_id,
			'authorization': 'Bearer ' + bearer
		},
		body: '{"member_type":"CONNECT_STATE","device":{"device_info":{"capabilities":{"can_be_player":false,"hidden":true}}}}'
		}
	).catch((error)=> {console.log("error");console.log(error);});
	return response.json();
}


