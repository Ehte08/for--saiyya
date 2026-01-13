import React, { useMemo, useCallback } from "react";
import { Routes, Route } from "react-router-dom";

import Header from "./components/Header.jsx";
import CursorHearts from "./components/CursorHearts.jsx";

import FirstPage from "./pages/FirstPage.jsx";
import NotesPage from "./pages/NotesPage.jsx";
import ThirdPage from "./pages/ThirdPage.jsx";
import FourthPage from "./pages/FourthPage.jsx";
import Gf from "./pages/gf.jsx";

function Home() {
  const refs = useMemo(
    () => ({
      home: React.createRef(),
      notes: React.createRef(),
      movies: React.createRef(),
      music: React.createRef(),
    }),
    []
  );

  const scrollTo = useCallback(
    (key) => {
      const el = refs[key]?.current;
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [refs]
  );

  return (
    <>
      <Header onNavigate={scrollTo} />

      <main className="con">
        <section ref={refs.home} id="first-page">
          <FirstPage />
        </section>

        <section ref={refs.notes} id="second-page">
          <NotesPage />
        </section>

        <section ref={refs.movies} id="third-page">
          <ThirdPage />
        </section>

        <section ref={refs.music} id="fourth-page">
          <FourthPage />
        </section>
      </main>
    </>
  );
}

export default function App() {
  return (
    <>
      <CursorHearts />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Gf" element={<Gf />} />
      </Routes>
    </>
  );
}

