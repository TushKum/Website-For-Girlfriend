import { useEffect, useRef, useState } from 'react';

/** Public asset path that respects Vite's configured base. */
const SONG_URL = `${import.meta.env.BASE_URL}music/ahatamatarmusic.mp3`;

/**
 * MusicToggle.tsx
 *
 * A Y2K "boombox" button that plays your love song. Browsers block autoplay, so
 * it's a tap-to-play toggle (top-right). Loops softly; the glyph dances while
 * it's on. Swap the file in /public/music to change the song.
 */
export default function MusicToggle() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio(SONG_URL);
    audio.loop = true;
    audio.volume = 0.55;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (playing) {
        audio.pause();
        setPlaying(false);
      } else {
        await audio.play();
        setPlaying(true);
      }
    } catch {
      setPlaying(false);
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={playing ? 'Pause music' : 'Play our song'}
      className="brutal-btn pointer-events-auto fixed right-6 top-6 z-30 bg-cream"
    >
      <span className={playing ? 'y2k-twinkle inline-block' : 'inline-block'}>
        {playing ? '♪' : '♫'}
      </span>
      <span className="holo-text">{playing ? 'On' : 'Play'}</span>
    </button>
  );
}
