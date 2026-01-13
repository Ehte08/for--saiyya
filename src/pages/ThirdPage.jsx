import React, { useEffect, useMemo, useRef } from "react";

function Clip({ src, id }) {
  const ref = useRef(null);

  useEffect(() => {
    const vid = ref.current;
    if (!vid) return;

    // force metadata load like your script
    vid.load();

    const isDesktopWide = () => window.innerWidth > 900;

    const onEnter = () => {
      if (!isDesktopWide()) return;
      vid.play(); 
      vid.style.filter = "grayscale(0%)";
    };

    const onLeave = () => {
      if (!isDesktopWide()) return;
      vid.pause();
      vid.style.filter = "grayscale(100%)";
    };

    const onClick = () => {
      if (vid.paused) {
        vid.play();
        vid.style.filter = "grayscale(0%)";
      } else {
        vid.pause();
        vid.style.filter = "grayscale(100%)";
      }
    };

    vid.addEventListener("mouseenter", onEnter);
    vid.addEventListener("mouseleave", onLeave);
    vid.addEventListener("click", onClick);

    return () => {
      vid.removeEventListener("mouseenter", onEnter);
      vid.removeEventListener("mouseleave", onLeave);
      vid.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <video
      ref={ref}
      className="clip"
      id={id}
      src={src}
      playsInline
      preload="metadata"
    />
  );
}

export default function ThirdPage() {
  const clips = useMemo(
    () => [
      { id: "film1", src: "./Assets/clips/SPIDER-MAN_ ACROSS THE SPIDER-VERSE Clip - Gwen & Miles.mp4" },
      { id: "film2", src: "./Assets/clips/kat.mp4" },
      { id: "film3", src: "./Assets/clips/500 days.mp4" },
      { id: "film4", src: "./Assets/clips/Eyes full edit.mp4" },
      { id: "film5", src: "./Assets/clips/la-la-land.mp4" },
      { id: "film6", src: "./Assets/clips/states.mp4" },
    ],
    []
  );

  return (
    <>
      <div className="page3-title">
        Movie Scenes <br />
        <span id="byline3"> That remind me of you</span>
      </div>

      <div className="video-grid">
        {clips.map((c) => (
          <Clip key={c.id} id={c.id} src={c.src} />
        ))}
      </div>
    </>
  );
}
