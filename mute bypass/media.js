// buffer
var buffered_track = undefined;

// create a media element
var mediaElement = undefined;
function initMediaElement() {
	mediaElement = document.createElement('audio');
	mediaElement.type = 'audio/mpeg';
	mediaElement.defaultPlaybackRate = 5.0;
	mediaElement.pause();
	document.body.appendChild(mediaElement);
}

// change src
function changeTrack(url) {
	mediaElement.src = url;
	console.log("url changed");
}

initMediaElement();