async function backupData() {
	// Get users playlists (name, description, tracks(id))
	const playlists = await getItemsFromSpotify("https://api.spotify.com/v1/me/playlists");
	// Get users liked songs (id's)
	const tracks = await getItemsFromSpotify("https://api.spotify.com/v1/me/tracks");
	// Get users saved albums
	const albums = await getItemsFromSpotify("https://api.spotify.com/v1/me/albums");
	// Get users followed artists/users (id's)
	const artists = await getItemsFromSpotify("https://api.spotify.com/v1/me/following?type=artist");
	
	// Store data in a json
	const data = {"playlists": playlists, "tracks": tracks, "albums": albums, "artists": artists};
	const data_as_string = JSON.stringify(data, null, 4);
	
	// One messy way of downloading a file
	const date = new Date();
	var vLink = document.createElement('a'),
	vBlob = new Blob([data_as_string], {type: "octet/stream"}),
	vName = 'spotify_backup_' + date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+ '.json',
	vUrl = window.URL.createObjectURL(vBlob);
	vLink.setAttribute('href', vUrl);
	vLink.setAttribute('download', vName );
	vLink.click();
}

// Create a get request to spotify and returns all the items from a "paging object" (see spotify web api)
async function getItemsFromSpotify(url) {
	var json = await requestSpotify(url);
	var data = json["items"];
	while(json["next"] !== null && json["next"] !== undefined) {
		json = await requestSpotify(json["next"]);
		data.push(...json["items"]);
	}
	return data;
}

// Create a get request to spotify, it includes the Bearer authentication and returns as json.
async function requestSpotify(url) {
	const response = await fetch(url, {method: 'GET', headers: {'Authorization': 'Bearer ' + bearer}})
		.catch((error) => {console.log("error: " + error + ", url: " + url);});
	return response.json();
}