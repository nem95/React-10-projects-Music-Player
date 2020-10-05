import useSpotify from '../hooks/useSpotify';

import styles from './style/Reco.module.css';

const Reco = (props) => {
  const { tracks, token, refreshToken, recommendations } = props;

  return (
    <div className={styles.reco__container}>
      <h1>Recommendations</h1>

      <div className={styles.reco__list__wrapper}>
        {recommendations && recommendations.map((reco, i) => (
          <div className={styles.reco__list__item} key={i.toString()}>
            <img src={reco.images[0].url} className={styles.reco__item__img} />
            <h1>{reco.name}</h1>
          </div>
        ))}
      </div>

    </div>
  )
};

export default Reco;
