import React, { useEffect, useMemo, useRef, useState } from "react";

function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: none) and (pointer: coarse)");
    const update = () => setIsTouch(!!mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return isTouch;
}

let globalZ = 1;

function Paper({ className = "", children, resetSignal, initialZ = 1 }) {
  const ref = useRef(null);

  const stateRef = useRef({
    holding: false,
    rotating: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    prevMouseX: 0,
    prevMouseY: 0,
    mouseTouchX: 0,
    mouseTouchY: 0,
    rotation: Math.random() * 30 - 15,
    hasInitialRotation: false,
  });

  const isTouch = useIsTouchDevice();

  // set initial stacking order once
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.zIndex = String(initialZ);
  }, [initialZ]);

  // smooth reset (position + z-index)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const s = stateRef.current;

    // stop any current interaction
    s.holding = false;
    s.rotating = false;

    // reset position values
    s.offsetX = 0;
    s.offsetY = 0;

    // reset z-order to original
    el.style.zIndex = String(initialZ);

    // enable a transition just for the reset
    el.style.transition = "transform 450ms cubic-bezier(0.22, 1, 0.36, 1)";

    requestAnimationFrame(() => {
      el.style.transform = `translate(0px, 0px) rotate(${s.rotation}deg)`;
    });

    // remove transition after animation so dragging stays snappy
    const t = setTimeout(() => {
      if (ref.current) ref.current.style.transition = "none";
    }, 480);

    return () => clearTimeout(t);
  }, [resetSignal, initialZ]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onContextMenu = (e) => e.preventDefault();
    el.addEventListener("contextmenu", onContextMenu);

    const onMouseMove = (e) => {
      const s = stateRef.current;
      if (!s.holding) return;

      if (s.rotating) {
        const dirX = e.clientX - s.mouseTouchX;
        const dirY = e.clientY - s.mouseTouchY;
        const angle = Math.atan2(dirY, dirX);
        let deg = (180 * angle) / Math.PI;
        deg = (360 + Math.round(deg)) % 360;
        s.rotation = deg;
      } else {
        const velX = e.clientX - s.prevMouseX;
        const velY = e.clientY - s.prevMouseY;
        s.offsetX += velX;
        s.offsetY += velY;
        s.prevMouseX = e.clientX;
        s.prevMouseY = e.clientY;
      }

      el.style.transform = `translate(${s.offsetX}px, ${s.offsetY}px) rotate(${s.rotation}deg)`;
    };

    const onMouseUp = () => {
      const s = stateRef.current;
      s.holding = false;
      s.rotating = false;
    };

    document.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      el.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const onMouseDown = (e) => {
    if (isTouch) return;
    const el = ref.current;
    if (!el) return;

    const s = stateRef.current;
    if (s.holding) return;

    // disable transition while dragging
    el.style.transition = "none";

    s.holding = true;
    el.style.zIndex = String(globalZ++);
    s.prevMouseX = e.clientX;
    s.prevMouseY = e.clientY;

    if (e.button === 0) {
      s.rotating = false;
    } else if (e.button === 2) {
      s.rotating = true;
      s.mouseTouchX = e.clientX;
      s.mouseTouchY = e.clientY;
    }
  };

  const onTouchStart = (e) => {
    if (!isTouch) return;
    if (e.touches.length > 1) return;

    const el = ref.current;
    if (!el) return;

    e.preventDefault();

    // disable transition while dragging
    el.style.transition = "none";

    const s = stateRef.current;
    s.holding = true;
    el.style.zIndex = String(globalZ++);

    const touch = e.touches[0];
    s.startX = touch.clientX - s.offsetX;
    s.startY = touch.clientY - s.offsetY;

    if (!s.hasInitialRotation) {
      el.style.transform = `translate(${s.offsetX}px, ${s.offsetY}px) rotate(${s.rotation}deg)`;
      s.hasInitialRotation = true;
    }
  };

  const onTouchMove = (e) => {
    if (!isTouch) return;
    if (!stateRef.current.holding) return;
    if (e.touches.length > 1) return;

    e.preventDefault();

    const el = ref.current;
    if (!el) return;

    const s = stateRef.current;
    const touch = e.touches[0];
    s.offsetX = touch.clientX - s.startX;
    s.offsetY = touch.clientY - s.startY;

    el.style.transform = `translate(${s.offsetX}px, ${s.offsetY}px) rotate(${s.rotation}deg)`;
  };

  const onTouchEnd = () => {
    if (!isTouch) return;
    stateRef.current.holding = false;
  };

  return (
    <div
      ref={ref}
      className={`paper ${className}`.trim()}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {children}
    </div>
  );
}

export default function NotesPage() {
  const [resetSignal, setResetSignal] = useState(0);

  const notes = useMemo(
    () => [
      { type: "heart" },
      { lines: ["I just want to be staring into", "Her Eyes while she talks (burn those glasses)"] },
      { lines: ["How can someone be so pretty", " and also fucking smart? "] },
      { lines: ["Tere sang chain bhi mujhko, tere sang bekharari hai", " ki mein toh khurbaan "] },
      { top: true, lines: ["She is... Mine", "In every sense of the word"] },
      { top: true, lines: ["Random snippets", "From my Journal"] },
      { top: true, lines: ["Drag the papers, Princess"] },
    ],
    []
  );

  useEffect(() => {
  globalZ = notes.length + 1; // start above the highest initialZ
  }, [notes.length]);

  const openLink = () => {
    const base = window.location.href.split("#")[0]; // keeps /repo-name/ on GitHub Pages
    window.open(`${base}#/Gf`, "_blank", "noopener,noreferrer");
  };



  const clickTimerRef = useRef(null);
  const CLICK_DELAY_MS = 250;

  useEffect(() => {
    return () => {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    };
  }, []);

  const onHeartClick = () => {
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

    clickTimerRef.current = setTimeout(() => {
      openLink();
      clickTimerRef.current = null;
    }, CLICK_DELAY_MS);
  };

  const doReset = () => {
    // reset global z so stacking starts "fresh" after reset
    globalZ = notes.length + 1;
    setResetSignal((x) => x + 1);
  };

  const onHeartDoubleClick = () => {
    // cancel pending single-click so link doesn't open
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    doReset();
  };

  return (
    <>
      {notes.map((n, idx) => {
        const initialZ = idx + 1;

        if (n.type === "heart") {
          return (
            <Paper
              key={idx}
              className="heart-cont"
              resetSignal={resetSignal}
              initialZ={initialZ}
            >
              <img
                className="notes-heart"
                src="/Assets/heart.webp"
                alt="heart"
                onClick={onHeartClick}
                onDoubleClick={onHeartDoubleClick}
              />
            </Paper>
          );
        }

        return (
          <Paper
            key={idx}
            className={`${n.top ? "top" : "image"}`}
            resetSignal={resetSignal}
            initialZ={initialZ}
          >
            {n.lines.map((line, i) => (
              <p key={i} className={n.top ? "p1" : undefined}>
                {line}
              </p>
            ))}
          </Paper>
        );
      })}
    </>
  );
}
