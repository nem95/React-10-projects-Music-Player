import { useEffect, useState } from 'react';
import styles from './style/Player.module.css'

const Player = (props) => {
  const { tracks } = props;
  const [playerReady, setPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [nextTrack, setNextTrack] = useState(null);
  const [prevTrack, setPrevTrack] = useState(null);
  const [deviceId, setDeviceId] = useState(null);

  const toggleAction = async (action) => {
    if (window.Spotify) {
      const token = props.token;

      const player = new Spotify.Player({
        name: 'Web Playback SDK Quick Start Player',
        getOAuthToken: cb => {

          cb(token);
        },
        volume: 0.5,
      });

      const play = ({
        spotify_uri,
        playerInstance: {
          _options: {
            getOAuthToken,
            volume
          }
        }
      }) => {
        getOAuthToken(access_token => {
          fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
            method: 'PUT',
            body: JSON.stringify({
              uris: [...spotify_uri],
              volume
            }),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${props.token}`
            },
          });
        });
      };

      try {
        const option = {
          method: 'put',
          headers: new Headers({
            'Authorization': `Bearer ${token}`,
          }),
        }

        const optionSkip = {
          method: 'post',
          headers: new Headers({
            'Authorization': `Bearer ${token}`,
          }),
        }

        if (action === 'play') {
          play({
            playerInstance: player,
            spotify_uri: tracks.items.map((item) => item.track.uri),
          });

          setIsPlaying(true);
        }

        if (action === 'pause') {
          const data = await fetch('https://api.spotify.com/v1/me/player/pause', option);
          console.log('Paused!');

          setIsPlaying(false);
        }

        if (action === 'resume') {
          await fetch('https://api.spotify.com/v1/me/player/play', option);
          console.log('resumed !');

          setIsPlaying(true);
        }

        if (action === 'next') {
          await fetch(`https://api.spotify.com/v1/me/player/next?device_id=${deviceId}`, optionSkip);
          console.log('resumed !');

          setIsPlaying(true);
        }

        if (action === 'prev') {
          await fetch(`https://api.spotify.com/v1/me/player/previous?device_id=${deviceId}`, optionSkip);
          console.log('resumed !');

          setIsPlaying(true);
        }
        player.addListener('player_state_changed', state => {
          const { paused, track_window } = state;

          setCurrentTrack(track_window.current_track)
          setNextTrack(track_window.next_tracks);
          setPrevTrack(track_window.previous_tracks);

          if (paused) {
            setIsPlaying(false);
          } else {
            setIsPlaying(true);
          }
          console.log(state);
        });

      } catch (error) {
        console.error(error);
      }
    }
  }

  useEffect(() => {
    window.onSpotifyWebPlaybackSDKReady = () => {
      const token = props.token;
      const player = new Spotify.Player({
        name: 'Web Playback SDK Quick Start Player',
        getOAuthToken: cb => { cb(token); }
      });

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

        setPlayerReady(true)
      });
    };

    if (!playerReady) {
      window.onSpotifyWebPlaybackSDKReady();
    }
  })

  return (
    <div>
      Player

      {tracks && currentTrack && (
        <div className={styles.image__container} >
          {prevTrack && prevTrack.length > 0 && (
            <img src={prevTrack[prevTrack.length - 1].album.images[0].url} alt="" className={styles.prev__track}/>
          )}

          <img src={currentTrack.album.images[0].url} alt="" className={styles.current__track}/>

          {nextTrack && nextTrack.length > 0 && (
            <img src={nextTrack[0].album.images[0].url} alt="" className={styles.next__track}/>
          )}
        </div>
      )}

      {!isPlaying && (
        <div>
          <button onClick={() => toggleAction('play')}>Play song</button>
          <button onClick={() => toggleAction('resume')}>Resume</button>
        </div>
      )}

      {isPlaying && (
        <div>
          <button onClick={() => toggleAction('pause')}>Pause song</button>
        </div>
      )}

      {prevTrack && prevTrack.length > 0 && (
        <button onClick={() => toggleAction('prev')}>Previous song</button>
      )}

      {nextTrack && nextTrack.length > 0 && (
        <button onClick={() => toggleAction('next')}>Next song</button>
      )}

    </div>
  )
};

export default Player;
