# Spotify-ad-bypass
Bypass Spotify's ads. Be aware that this is against Spotify's terms. We strongly recommend you to use this for educational purposes only.
## With reload (not so safe)
This extension reloads Spotify every 5(configurable) tracks, which leads to a pause of around 1 second instead of a 30 second ad.
However there is a disadvantage, spotify can detect your unusual trafic which leads to an account ban (see Spotify terms). To work around this problem, you can create a backup of all your tracks and playlists.
### How it works
- Wait until spotify is fully loaded => keep looking until a DOM element created by Spotify is loaded.
- Keep track how many tracks are played.
- Reload the page after x tracks and press the play button.