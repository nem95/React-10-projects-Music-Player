import { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css';

import Player from '../components/Player';

export default function Home() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [tracks, setTracks] = useState(null);

  const authUrl = 'https://accounts.spotify.com/authorize?';
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const redirectUri = "http://localhost:3000";
  const scopes = [
    "user-read-currently-playing",
    "user-read-playback-state",
    "streaming",
    "user-read-email",
    "user-read-private",
    "user-library-read",
    "user-modify-playback-state"
  ];

  useEffect(() => {
    const fetchUser = async () => {
      const option = {
        method: 'get',
        headers: new Headers({
          'Authorization': `Bearer ${token}`,
        }),
      }

      try {
        const data = await fetch('https://api.spotify.com/v1/me', option);
        const user = await data.json();

        setUser(user);

        const tracksData = await fetch('https://api.spotify.com/v1/me/tracks?limit=50', option);
        const tracksJson = await tracksData.json();

        setTracks(tracksJson)
        console.log(tracksJson);
      } catch (error) {
        console.error(error);
      }
    }

    if (!token) {
      const hash = window.location.hash
        .substring(1)
        .split("&")
        .reduce(function(initial, item) {
          if (item) {
            const parts = item.split("=");
            initial[parts[0]] = decodeURIComponent(parts[1]);
          }
          return initial;
        }, {});

      if (hash.access_token) {
        setToken(hash.access_token);
      }
      console.log(hash);
    } else {
      if(!user) {
        fetchUser()
      }
    }
  })

  return (
    <div className={styles.container}>
      {!token && (
        <a
          className={styles.connect__btn}
          href={`${authUrl}client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join("%20")}&response_type=token&show_dialog=true`}
        >
          Login to Spotify
        </a>
      )}

      {tracks && token && (
        <Player token={token} tracks={tracks}/>
      )}
    </div>
  )
}
