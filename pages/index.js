import { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css';

import Player from '../components/Player';
import Reco from '../components/Reco';

export default function Home() {
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [user, setUser] = useState(null);
  const [tracks, setTracks] = useState(null);
  const [recommendations, setRecommendations] = useState(null);

  const authUrl = 'http://localhost:8888/login';

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

    const getReco = async () => {
      const option = {
        method: 'get',
        headers: new Headers({
          'Authorization': `Bearer ${token}`,
        }),
      }

      try {
        const data = await fetch('https://api.spotify.com/v1/browse/featured-playlists?limit=4', option);
        const { playlists: {
          items
        }} = await data.json();

        console.log(items);
        setRecommendations(items);
      } catch (error) {
        console.log(error);
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
        setRefreshToken(hash.access_token);
      }
      console.log(hash);
    } else {
      if(!user) {
        fetchUser()
      }
    }

    if (token && !recommendations) {
      getReco();
    }
  })

  return (
    <div className={styles.container}>
      {!token && (
        <a
          className={styles.connect__btn}
          href={authUrl}
        >
          Login to Spotify
        </a>
      )}

      {recommendations && token && (
        <Reco token={token} refreshToken={refreshToken} recommendations={recommendations} />
      )}

      {tracks && token && (
        <Player token={token} refreshToken={refreshToken} tracks={tracks}/>
      )}
    </div>
  )
}
