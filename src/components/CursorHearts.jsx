import React, { useEffect, useMemo, useRef, useState } from "react";

export default function CursorHearts() {
  const [enabled, setEnabled] = useState(false);

  const cursorRef = useRef(null);
  const hasMovedRef = useRef(false);

  const heart1Ref = useRef(null);
  const heart2Ref = useRef(null);
  const heart3Ref = useRef(null);
  const heart4Ref = useRef(null);

  const hearts = useMemo(
    () => [
      { ref: heart4Ref, dx: 24, dy: 10, ease: 0.13 },
      { ref: heart3Ref, dx: 21, dy: 8, ease: 0.17 },
      { ref: heart1Ref, dx: 18, dy: 6, ease: 0.20 },
      { ref: heart2Ref, dx: 15, dy: 5, ease: 0.27 },
    ],
    []
  );

  useEffect(() => {
    const isCoarse = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(!isCoarse && !reduceMotion);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // ✅ initial CSS position for the .cursor div (before any movement)
    const cursorEl = cursorRef.current;
    if (cursorEl) {
      cursorEl.style.top = "25px";
      cursorEl.style.left = "115px";
    }

    let tx = 0;
    let ty = 0;
    const state = hearts.map(() => ({ x: 0, y: 0 }));

    let raf = 0;

    const animate = () => {
      for (let i = 0; i < hearts.length; i++) {
        const h = hearts[i];
        const s = state[i];

        s.x += (tx - s.x) * h.ease;
        s.y += (ty - s.y) * h.ease;

        const el = h.ref.current;
        if (el) {
          el.style.transform = `translate3d(${s.x + h.dx}px, ${s.y + h.dy}px, 0)`;
        }
      }

      raf = requestAnimationFrame(animate);
    };

    const onMove = (e) => {
      // ✅ first movement: "forget" the startup top/left by resetting them
      if (!hasMovedRef.current) {
        hasMovedRef.current = true;
        const c = cursorRef.current;
        if (c) {
          c.style.top = "0px";
          c.style.left = "0px";
        }
      }

      tx = e.clientX;
      ty = e.clientY;
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled, hearts]);

  if (!enabled) return null;

  return (
    <div className="cursor" ref={cursorRef} aria-hidden="true">
      <div className="heart4" ref={heart4Ref} />
      <div className="heart3" ref={heart3Ref} />
      <div className="heart" ref={heart1Ref} />
      <div className="heart2" ref={heart2Ref} />
    </div>
  );
}
