import React, { useEffect, useMemo, useRef, useState } from "react";

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function MusicPlayer() {
  const tracks = useMemo(
    () => [
      // Add any songs
      { title: "Embrasse Moi", artist: "Clementine", mp3Src: "./Assets/Songs/moi.mp3", bannerImageSrc: "./Assets/album-cover/spidey.png" },
      { title: "Love Bug", artist: "Okayceci", mp3Src: "./Assets/Songs/bug.mp3", bannerImageSrc: "./Assets/album-cover/sai2.jpeg" },
      { title: "The 1", artist: "Taylor Swift", mp3Src: "./Assets/Songs/one.mp3", bannerImageSrc: "./Assets/album-cover/saie.jpeg" },
      { title: "Mast Magan", artist: "Arjit Singh", mp3Src: "./Assets/Songs/peel.mp3", bannerImageSrc: "./Assets/album-cover/saiheart.jpeg" },
      { title: "Roi", artist: "Videoclub", mp3Src: "./Assets/Songs/roi.mp3", linkUrl: "https://genius.com/Genius-english-translations-videoclub-roi-english-translation-lyrics", bannerImageSrc: "./Assets/album-cover/roi.jpg" },
      { title: " En Nuit", artist: "Videoclub", mp3Src: "./Assets/Songs/nuit.mp3", linkUrl: "https://genius.com/Genius-english-translations-videoclub-en-nuit-english-translation-lyrics", bannerImageSrc: "./Assets/album-cover/super.jpeg" },
      { title: "Big City Blues", artist: "Michate", mp3Src: "./Assets/Songs/blue.mp3", bannerImageSrc: "./Assets/album-cover/saismile.jpeg" },
      { title: "Princess", artist: "Clearance James", mp3Src: "./Assets/Songs/princess.mp3", bannerImageSrc: "./Assets/album-cover/saidayy.jpeg" },
      { title: "Stargirl", artist: "Lana Del Rey", mp3Src: "./Assets/Songs/star.mp3", bannerImageSrc: "./Assets/album-cover/sailap.jpeg" },
      { title: "Red", artist: "Santino", mp3Src: "./Assets/Songs/red.mp3", bannerImageSrc: "./Assets/album-cover/choc.jpeg" },
      { title: "Nobody New", artist: "The Marias", mp3Src: "./Assets/Songs/nobody.mp3", bannerImageSrc: "./Assets/album-cover/pinkdress.jpeg" },
      { title: "Love and Doubt", artist: "Dacelynn", mp3Src: "./Assets/Songs/doubt.mp3", bannerImageSrc: "./Assets/album-cover/saibirth.jpeg" },
      { title: "Samjhawan", artist: "Alia Bhatt", mp3Src: "./Assets/Songs/samj.mp3", linkUrl: "https://www.filmyquotes.com/songs/243", bannerImageSrc: "./Assets/album-cover/rupanzel.png" },
      { title: "One Last Time", artist:"Summer Salt", mp3Src:"./Assets/Songs/summer.mp3", bannerImageSrc:"./Assets/album-cover/princess.jpg" },
  ],
    []
  );

  const audioRef = useRef(null);

  // refs to avoid stale closures inside event listeners
  const isSeekingRef = useRef(false);
  const shouldAutoPlayRef = useRef(false);
  const forceAutoPlayNextRef = useRef(false);

  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  const track = tracks[index];

  const prevIndex = (index - 1 + tracks.length) % tracks.length;
  const nextIndex = (index + 1) % tracks.length;

  const prevT = tracks[prevIndex];
  const nextT = tracks[nextIndex];

  // Attach audio listeners ONCE
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      const d = audio.duration || 0;
      setDuration(d);
    };

    const onTimeUpdate = () => {
      if (!isSeekingRef.current) {
        setCurrentTime(audio.currentTime || 0);
      }
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    const onEnded = () => {
      // auto-next when track ends
      forceAutoPlayNextRef.current = true;
      nextTrack(true);
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load new track when index changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;

    // remember if we should keep playing across track switches
    const wasPlaying = !audio.paused;
    shouldAutoPlayRef.current = forceAutoPlayNextRef.current || wasPlaying;
    forceAutoPlayNextRef.current = false;

    // reset UI
    setDuration(0);
    setCurrentTime(0);
    setSeekValue(0);
    setIsSeeking(false);
    isSeekingRef.current = false;

    // load track
    audio.src = track.mp3Src;
    audio.load();

    // If user was playing, continue playing the new track once it's ready
    if (shouldAutoPlayRef.current) {
      const tryPlay = async () => {
        try {
          await audio.play();
        } catch {
          // autoplay can fail in some browsers until user interacts
          setIsPlaying(false);
        }
      };

      // If metadata isn't ready yet, wait for it
      if (audio.readyState >= 2) {
        tryPlay();
      } else {
        const onCanPlay = () => {
          audio.removeEventListener("canplay", onCanPlay);
          tryPlay();
        };
        audio.addEventListener("canplay", onCanPlay);
      }
    }
  }, [index, track]);

  const playPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (audio.paused) await audio.play();
      else audio.pause();
    } catch {
      setIsPlaying(false);
    }
  };

  const prevTrack = () => {
    setIndex((i) => (i - 1 + tracks.length) % tracks.length);
  };

  const nextTrack = (_fromEnded = false) => {
    setIndex((i) => (i + 1) % tracks.length);
  };

  const openLink = () => {
    if (!track?.linkUrl) return;
    window.open(track.linkUrl, "_blank", "noopener,noreferrer");
  };

  // Seek (pointer events = mouse + touch)
  const startSeek = () => {
    setIsSeeking(true);
    isSeekingRef.current = true;
  };

  const moveSeek = (val) => {
    setSeekValue(val);
  };

  const endSeek = (val) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = val;
    setCurrentTime(val);

    setIsSeeking(false);
    isSeekingRef.current = false;
  };

  // keep slider value synced when NOT seeking
  useEffect(() => {
    if (!isSeeking) setSeekValue(currentTime);
  }, [currentTime, isSeeking]);

  // Optional keyboard shortcuts
  const onRootKeyDown = (e) => {
    const audio = audioRef.current;

    if (e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      playPause();
    }
    if (e.key === "n" || e.key === "N") nextTrack(false);
    if (e.key === "p" || e.key === "P") prevTrack();

    if (!audio) return;

    if (e.key === "ArrowRight") audio.currentTime = Math.min((audio.currentTime || 0) + 5, duration || 0);
    if (e.key === "ArrowLeft") audio.currentTime = Math.max((audio.currentTime || 0) - 5, 0);
  };

  const effectiveValue = Math.min(seekValue, duration || 0);

  return (
    <div
      id="music-player-root"
      className="music-player-root"
      role="region"
      aria-label="Music player"
      tabIndex={0}
      onKeyDown={onRootKeyDown}
    >
      {/* Hidden audio element (reliable) */}
      <audio ref={audioRef} />

      {/* 1) HERO Banner row (main + prev/next previews) */}
      <div id="music-player-hero" className="music-player-hero">
        {/* Prev preview */}
        <button
          id="music-player-hero-prev"
          className="music-player-hero-side is-prev"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            prevTrack();
          }}
          aria-label={`Previous track: ${prevT?.title ?? "Previous"}`}
          title="Previous"
        >
          {prevT?.bannerImageSrc ? (
            <img
              key={prevT.id}
              className="music-player-hero-side-img"
              src={prevT.bannerImageSrc}
              alt=""
              draggable={false}
            />
          ) : (
            <div className="music-player-hero-side-fallback">⏮</div>
          )}
        </button>

        {/* Main banner */}
        <div
          id="music-player-hero-main"
          className="music-player-hero-main"
          role="button"
          tabIndex={0}
          aria-label="Now playing banner. Click to play/pause. Double click to translate."
          title="Click to play/pause • Double-click to open track link"
          onClick={() => playPause()}
          onDoubleClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openLink();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") playPause();
            if (e.key === " ") {
              e.preventDefault();
              playPause();
            }
          }}
        >
          {track?.bannerImageSrc ? (
            <img
              key={track.id}
              id="music-player-hero-main-img"
              className="music-player-hero-main-img"
              src={track.bannerImageSrc}
              alt=""
              draggable={false}
            />
          ) : (
            <div className="music-player-hero-main-fallback">🎵</div>
          )}

          {/* Overlay meta on top of the main image */}
          <div id="music-player-hero-overlay" className="music-player-hero-overlay">
            <div className="music-player-title">{track?.title ?? "—"}</div>
            <div className="music-player-artist">{track?.artist ?? "Unknown Artist"}</div>
          </div>
        </div>

        {/* Next preview */}
        <button
          id="music-player-hero-next"
          className="music-player-hero-side is-next"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            nextTrack(false);
          }}
          aria-label={`Next track: ${nextT?.title ?? "Next"}`}
          title="Next"
        >
          {nextT?.bannerImageSrc ? (
            <img
              key={nextT.id}
              className="music-player-hero-side-img"
              src={nextT.bannerImageSrc}
              alt=""
              draggable={false}
            />
          ) : (
            <div className="music-player-hero-side-fallback">⏭</div>
          )}
        </button>
      </div>

      <div className="below-banner">
        {/* 3) Time */}
        <div id="music-player-time" className="music-player-time" aria-label="Time display">
          <div id="music-player-time-current" className="music-player-time-current">
            {formatTime(isSeeking ? seekValue : currentTime)}
          </div>
          <div id="music-player-seek" className="music-player-seek">
            <input
              id="music-player-seek-input"
              className="music-player-seek-input"
              type="range"
              min={0}
              max={Math.max(0, duration)}
              step={0.1}
              value={effectiveValue}
              aria-label="Seek bar"
              onPointerDown={startSeek}
              onChange={(e) => moveSeek(Number(e.target.value))}
              onPointerUp={(e) => endSeek(Number(e.target.value))}
            />
          </div>
          <div id="music-player-time-duration" className="music-player-time-duration">
            {formatTime(duration)}
          </div>
        </div>

        {/* 4) Controls */}
        <div id="music-player-controls" className="music-player-controls">
          <button
            id="music-player-prev"
            className="music-player-prev"
            type="button"
            onClick={prevTrack}
            aria-label="Previous track"
            title="Previous (P)"
          >
            ⏮
          </button>

          <button
            id="music-player-playpause"
            className="music-player-playpause"
            type="button"
            onClick={playPause}
            aria-label={isPlaying ? "Pause" : "Play"}
            title="Play/Pause (Space)"
          >
            {isPlaying ? "⏸" : "▶"}
          </button>

          <button
            id="music-player-next"
            className="music-player-next"
            type="button"
            onClick={() => nextTrack(false)}
            aria-label="Next track"
            title="Next (N)"
          >
            ⏭
          </button>
        </div>
      </div>
    </div>

  );
}
