import { useState, useEffect } from 'react';

function useSpotify(token) {
  const [spotifyPlayer, setSpotifyPlayer] = useState(null);

  const [playerReady, setPlayerReady] = useState(false);
  const [deviceId, setDeviceId] = useState(null);

  useEffect(() => {
    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new Spotify.Player({
        name: 'Web Playback SDK Quick Start Player',
        getOAuthToken: cb => { cb(token); },
        volume: 0.5,
      });

      console.log('init');
      // Error handling
      player.addListener('initialization_error', ({ message }) => { console.error(message); });
      player.addListener('authentication_error', ({ message }) => { console.error(message); });
      player.addListener('account_error', ({ message }) => { console.error(message); });
      player.addListener('playback_error', ({ message }) => { console.error(message); });

      // Playback status updates
      player.addListener('player_state_changed', state => { console.log(state); });

      // Ready
      player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id)
      });

      // Not Ready
      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
      });

      // Connect to the player!
      player.connect().then(success => {
        if (success) {
          console.log('The Web Playback SDK successfully connected to Spotify!');
        }

        setPlayerReady(true);
        setSpotifyPlayer(player)
      });
    };

    if (!playerReady) {
      window.onSpotifyWebPlaybackSDKReady();
    }

  }, [spotifyPlayer]);

  return {
    'player': spotifyPlayer,
    deviceId,
  };
}


export default useSpotify;
