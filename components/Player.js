import { useState } from 'react';

import useSpotify from '../hooks/useSpotify';

import styles from './style/Player.module.css';
import PlayIcon from '../assets/img/play.svg';
import PauseIcon from '../assets/img/pause.svg';
import NextPrevIcon from '../assets/img/next_prev.svg';

const Player = (props) => {
  const { tracks, token, refreshToken } = props;
  const { player, deviceId} = useSpotify(token, refreshToken);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [nextTrack, setNextTrack] = useState(null);
  const [prevTrack, setPrevTrack] = useState(null);
  const [soundLevel, setSoundLevel] = useState(null);

  const toggleAction = async (action) => {
    if (window.Spotify) {
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
              'Authorization': `Bearer ${token}`
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
          await player.pause();
          console.log('Paused!');

          setIsPlaying(false);
        }

        if (action === 'resume') {
          await player.resume();
          console.log('resumed !');

          setIsPlaying(!isPlaying);
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

  const toggleSoundLevelChange = async (e) => {
    console.log(e.target.value);
    setSoundLevel(e.target.value);

    await player.setVolume(e.target.value / 100);
  };

  if (currentTrack) {
    console.log(currentTrack);
  }

  return (
    <div>
      Player

      {tracks && currentTrack && (
        <div className={styles.image__container} >
          {prevTrack && prevTrack.length > 0 && (
            <div className={styles.prev__track}>
              <img src={prevTrack[prevTrack.length - 1].album.images[0].url} alt="" />

              <button onClick={() => toggleAction('prev')} className={styles.prev__button}>
                <img src={NextPrevIcon} className={styles.prev__icon}/>
              </button>
            </div>
          )}

          <div className={styles.current__track}>
            <img src={currentTrack.album.images[0].url} alt="" />

              {isPlaying ? (
                <button onClick={() => toggleAction('pause')} className={styles.play__pause__button}>
                  <img src={PauseIcon} className={styles.play__pause__icon}/>
                </button>
              ) : (
                <button onClick={() => toggleAction('resume')} className={styles.play__pause__button}>
                  <img src={PlayIcon} className={styles.play__pause__icon}/>
                </button>
              )}
          </div>

          {nextTrack && nextTrack.length > 0 && (
            <div  className={styles.next__track}>
              <img src={nextTrack[0].album.images[0].url} alt=""/>

              <button onClick={() => toggleAction('next')} className={styles.next__button}>
                <img src={NextPrevIcon} className={styles.next__icon}/>
              </button>
            </div>
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

      <input
        type="range"
        min="0"
        max="100"
        value={soundLevel ? soundLevel : '50'}
        onChange={(e) => toggleSoundLevelChange(e)}
      />
    </div>
  )
};

export default Player;
