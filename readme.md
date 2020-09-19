# Spotify-ad-bypass
Bypass Spotify's ads. Be aware that this is against Spotify's terms. We strongly recommend you to use this for educational purposes only.
## With reload (not so safe)
This extension reloads Spotify every 5(configurable) tracks, which leads to a pause of around 1 second instead of a 30 second ad.
However there is a disadvantage, spotify can detect your unusual trafic which leads to an account ban (see Spotify terms). To work around this problem, you can create a backup of all your tracks and playlists.
### How it works
- Wait until spotify is fully loaded => keep looking until a DOM element created by Spotify is loaded.
- Keep track how many tracks are played.
- Reload the page after x tracks and press the play button.
## With mute
This extension mutes your tab when an ad starts, in the meantime it plays the next track in your queue from youtube. This is less detectable because spotify thinks you're listening the ad but it uses an undocumented piece of the SpotifyApi which can be detected.
### How it works
- Detects when an ad starts (By observing the title DOM element)
- Mute the tab where spotify is playing
- Request spotify which tracks are in the queue
- Get the next track and find a comparable on Youtube
- Play this track
- When the track has ended, skip the next track on spotify and press play

## Spotify API
|Get users playback|<span style="font-weight:normal">Get a users queue including ads</span>|
|-|-|
|Endpoint|`POST https://gew-spclient.spotify.com/connect-state/v1/devices/hobs_ + device_id[0:-5]`|
|Headers|x-spotify-connection-id: `connection_id` <br> authorization: Bearer `bearer`|
|Body|`{"member_type":"CONNECT_STATE","device":{"device_info":{"capabilities":{"can_be_player":false,"hidden":true}}}}`|
|`device_id[0:-5]`|The first 35 chars, a device_id has 40 chars|
|`device_id`|Can be retrieved from the **devices** request|
|`connection_id`|Can be retrieved from the **devices** request|
|`bearer`|Can be retrieved from the **devices** request|

<br>

|Devices request|<span style="font-weight:normal">No idea what is does, but all the necessary variables can be found here</span>|
|-|-|
|Endpoint|`POST https://gew-spclient.spotify.com/track-playback/v1/devices`|
|Headers|authorization: Bearer `bearer`|
|Request body|A json that contains the connection_id (`json['connection_id'`)<br>and the device_id (`json['device']['device_id']`)
