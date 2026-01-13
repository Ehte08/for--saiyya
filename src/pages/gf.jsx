import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export default function Gf() {
  const areaRef = useRef(null);
  const noRef = useRef(null);

  const [yesScale, setYesScale] = useState(0.5);
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [posReady, setPosReady] = useState(false);
  const [showTiara, setShowTiara] = useState(false);
  const [noFloating, setNoFloating] = useState(false);
  const [flowersOn, setFlowersOn] = useState(false);

  // keep the "No" button inside the page edges
 const padding = 20;

const placeNoInViewport = useCallback((xPct = 0.65, yPct = 0.55) => {
  const noBtn = noRef.current;
  if (!noBtn) return;

  const noRect = noBtn.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const x = clamp(vw * xPct, padding, vw - noRect.width - padding);
  const y = clamp(vh * yPct, padding, vh - noRect.height - padding);

  setNoPos({ x, y });
  setPosReady(true);
}, []);

const randomizeNoPosition = useCallback(() => {
  const noBtn = noRef.current;
  if (!noBtn) return;

  const noRect = noBtn.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const maxX = vw - noRect.width - padding;
  const maxY = vh - noRect.height - padding;

  const x = clamp(padding + Math.random() * (maxX - padding), padding, maxX);
  const y = clamp(padding + Math.random() * (maxY - padding), padding, maxY);

  setNoPos({ x, y });
  setPosReady(true);
}, []);

  // Set initial no-button position once measured (and keep it valid on resize)
  useEffect(() => {
    if (!noFloating) return;

    const onResize = () => randomizeNoPosition();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [noFloating, randomizeNoPosition]);

useEffect(() => {
  const page = areaRef.current;
  if (!page) return;

  const reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const layer = page.querySelector(".flowerLayer");
  if (!layer) return;

  const rand = (min, max) => min + Math.random() * (max - min);

  const flowerUrls = ["./Assets/flowers/hib.png", "./Assets/flowers/lil.png", "./Assets/flowers/pink.png"];

  // =========================
  // ✅ CHANGE THIS NUMBER
  // =========================
  const FLOWERS_PER_IMAGE = 35;
  const SIZE = 45;

  let nodes = [];

  const clearAll = () => {
    nodes.forEach((n) => {
      gsap.killTweensOf(n);
      n.remove();
    });
    nodes = [];
    layer.innerHTML = "";
  };

  const spawn = () => {
    clearAll();

    const w = window.innerWidth;
    const h = window.innerHeight;

    Object.assign(layer.style, {
      position: "fixed",
      inset: "0",
      overflow: "hidden",
      pointerEvents: "none",
    });

    flowerUrls.forEach((url, idx) => {
      for (let i = 0; i < FLOWERS_PER_IMAGE; i++) {
        // wrapper = controls falling (Y)
        const wrap = document.createElement("div");
        Object.assign(wrap.style, {
          position: "absolute",
          left: "0px",
          top: "0px",
          width: `${SIZE}px`,
          height: `${SIZE}px`,
          willChange: "transform",
          pointerEvents: "none",
        });

        // inner = controls image + wiggle/rotation
        const el = document.createElement("div");
        Object.assign(el.style, {
          width: "100%",
          height: "100%",
          backgroundImage: `url(${url})`,
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          willChange: "transform",
          pointerEvents: "none",
        });

        wrap.appendChild(el);
        layer.appendChild(wrap);
        nodes.push(wrap);

        const setStart = () => {
          gsap.set(wrap, {
            x: rand(0, w),
            y: rand(-400, -50), // ✅ start above the screen
            xPercent: -50,
            yPercent: -50,
          });

          gsap.set(el, {
            rotationZ: rand(0, 360),
            scale: rand(0.7, 1.25),
          });
        };

        setStart();

        const fallDur = rand(6, 14);

        // ✅ TOP -> BOTTOM happens here (only wrap controls y)
        gsap.to(wrap, {
          y: h + 140,
          duration: fallDur,
          ease: "none",
          repeat: -1,
          delay: rand(-fallDur, 0),
          onRepeat: setStart,
        });

        // side drift (wrap controls x)
        gsap.to(wrap, {
          x: `+=${rand(60, 180)}`,
          duration: rand(3.5, 7.5),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });

        // rotation / wiggle (inner controls its own transforms)
        gsap.to(el, {
          rotationZ: `+=${rand(120, 300)}`,
          duration: rand(3, 8),
          repeat: -1,
          ease: "sine.inOut",
        });

        gsap.to(el, {
          y: `+=${rand(-18, 18)}`, // ✅ wiggle without breaking the fall
          duration: rand(2, 6),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    });
  };

  spawn();
  window.addEventListener("resize", spawn);

  return () => {
    window.removeEventListener("resize", spawn);
    clearAll();
  };
}, []);





  const handleNoAttempt = useCallback(() => {
    setYesScale((s) => Math.min(10, s + 0.5));
    setNoFloating(true);
    randomizeNoPosition();
  }, [randomizeNoPosition]);

  const handleYes = useCallback(() => {
    setFlowersOn(true);
    setShowTiara(true);
  }, []);

  const yesStyle = useMemo(
    () => ({
      "--scale": yesScale,
    }),
    [yesScale]
  );

  const noStyle = useMemo(
    () =>
      noFloating
        ? {
          transform: `translate3d(${noPos.x}px, ${noPos.y}px, 0)`,
          opacity: 1,
          pointerEvents: "auto",
          }
        : undefined,
    [noFloating, noPos]
  );
  return (
    <div className={`gfPage ${flowersOn ? "flowersOn" : ""}`} ref={areaRef}>
      <div className="flowerLayer" aria-hidden="true" />
      <div className="heroWrap">
        <img className="heroImg" src="./Assets/saiblue.jpeg" alt="saiblue" />
        
        <img
          className={`tiara ${showTiara ? "isOn" : ""}`}
          src="./Assets/tiara.png"
          alt="tiara"
        />

      </div>

      <div className="questionWrap">
        <h1 className="question">Do you wanna be my girlfriend?</h1>
      </div>

      <div className="buttonsWrap">
        {/* YES (heart) */}
          <button className="yesBtn" style={yesStyle} onClick={handleYes} aria-label="Yes">
            <img className="yesHeart" src="./Assets/yesHeart.png" alt="" />
            <span className="yesLabel">Yes</span>
          </button>


        {/* NO (dodges) — can move anywhere on the page */}
        <button
        ref={noRef}
        className={`noBtn ${noFloating ? "isFloating" : ""}`}
        style={noStyle}
        onMouseDown={handleNoAttempt}
        onTouchStart={handleNoAttempt}
        onMouseEnter={handleNoAttempt}
        aria-label="No"
        type="button"
        >
          No
        </button>
      </div>
    </div>
  );
}
