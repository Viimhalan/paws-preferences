import React, { useState, useEffect, useRef, useMemo  } from "react";
import TinderCard from "react-tinder-card";
import Confetti from "react-confetti";

export default function App() {
  const TOTAL = 10;
  const [cats, setCats] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedCats, setLikedCats] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const childRefs = useRef([]);
  const purrRef = useRef(null);
  const meowRef = useRef(null);

  // preload cat URLs
  useEffect(() => {
    const urls = Array.from({ length: TOTAL }, (_, i) => `https://cataas.com/cat?random=${Date.now()}-${i}`);
    urls.forEach((u) => {
      const img = new Image();
      img.src = u;
    });
    setTimeout(() => setCats(urls), 0);
    childRefs.current = Array(urls.length).fill(null);
  }, []);

  // load sounds
  useEffect(() => {
    purrRef.current = new Audio("https://actions.google.com/sounds/v1/animals/cat_purr_close.ogg");
    meowRef.current = new Audio("https://actions.google.com/sounds/v1/animals/cat_meow.ogg");
  }, []);

  // resize listener for confetti
  useEffect(() => {
    const update = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const theme = {
    background: darkMode ? "#763c00" : "#ffbc75",
    surface: darkMode ? "#0b1220" : "#ffffff",
    text: darkMode ? "#ffbc75" : "#763c00",
    accent: darkMode ? "#34d399" : "#ef476f",
    button: darkMode ? "#ffbc75" : "#763c00", 
    buttonText: darkMode ? "#763c00" : "#ffbc75",
  };

  const handleSwipe = (dir, realIndex) => {
    if (realIndex < 0 || realIndex >= cats.length) return;

    const url = cats[realIndex];
    if (dir === "right") {
      setLikedCats((prev) => [...prev, url]);
      purrRef.current?.play().catch(() => {});
    } else if (dir === "left") {
      meowRef.current?.play().catch(() => {});
    }

    setCurrentIndex((prev) => {
      const next = Math.max(prev, realIndex) + 1;
      if (next >= cats.length) {
        setShowSummary(true);
      }
      return next;
    });
  };

  const swipe = (dir) => {
    const idx = currentIndex;
    if (idx >= cats.length) return;
    const ref = childRefs.current[idx];
    if (ref && typeof ref.swipe === "function") {
      ref.swipe(dir);
    } else {
      handleSwipe(dir, idx);
    }
  };

  const restart = () => {
    const urls = Array.from({ length: TOTAL }, (_, i) => `https://cataas.com/cat?random=${Date.now()}-${i}`);
    urls.forEach((u) => new Image().src = u);
    setCats(urls);
	childRefs.current = Array(urls.length).fill(null);
    setLikedCats([]);
    setCurrentIndex(0);
    setShowSummary(false);
  };

  // ------------------------
  // Loading Screen
  // ------------------------
  if (cats.length === 0) {
    return (
      <div
        style={{
          background: theme.background,
          color: theme.text,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100vw",
          overflow: "hidden",
        }}
      >
        <div style={{ textAlign: "center" }}>
			<h2 style={{color: theme.text, margin: 0, padding: 0 }}>Loading cats… 🐱</h2>
        </div>
      </div>
    );
  }

  // ------------------------
  // Summary Screen
  // ------------------------
  if (showSummary) {
    return (
      <div
        style={{
          background: theme.background,
          color: theme.text,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          width: "100vw",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        <Confetti width={windowSize.width} height={windowSize.height} />
        <h1 style={{ marginBottom: 12 }}>You liked {likedCats.length} {likedCats.length === 1 ? "cat" : "cats"}!</h1>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginTop: 20, width: "100%", maxWidth: 800 }}>
          {likedCats.length === 0 ? (
            <div style={{ gridColumn: "1 / -1" }}>No liked cats yet — try again!</div>
          ) : (
            likedCats.map((u, i) => (
              <img key={i} src={u} alt={`liked-${i}`} style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 10 }} />
            ))
          )}
        </div>

        <div style={{ marginTop: 24 }}>
          <button onClick={restart} style={{ padding: "10px 14px", borderRadius: 8, marginRight: 10, background: theme.button, color: theme.buttonText}}>Restart</button>
          <button onClick={() => setDarkMode((d) => !d)} style={{ padding: "10px 14px", borderRadius: 8, background: theme.button, color: theme.buttonText}}>
            {darkMode ? " ☀️ " : " 🌑 "}
          </button>
        </div>
      </div>
    );
  }

  // ------------------------
  // Main Swipe UI
  // ------------------------
  const visible = cats.slice(currentIndex, currentIndex + 3);
  const progress = Math.round(((currentIndex) / cats.length) * 100);

  return (
    <div
      style={{
        background: theme.background,
        color: theme.text,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ position: "absolute", top: 20, left: 20, fontWeight: 600, fontSize: 14, }}>
        {currentIndex + 1} / {cats.length}
        <div style={{ width: 160, height: 6, background: theme.button, borderRadius: 10, marginTop: 4 }}>
          <div style={{ width: `${progress}%`, height: "100%", background: theme.background, borderRadius: 10, transition: "width 0.3s ease" }} />
        </div>
      </div>

      {/* Theme toggle */}
      <button
        onClick={() => setDarkMode((d) => !d)}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          fontSize: "1.3rem",
          zIndex: 200,
          background: theme.button,
          border: "none",
          cursor: "pointer",
          color: theme.text,
        }}
      >
        {darkMode ? " ☀️ " : " 🌑 "}
      </button>

      <div style={{ marginBottom: 20, opacity: 0.8, fontSize: 14, color: theme.text, fontWeight: "bold" }}>Swipe  👈🏽 to dislike, 👉🏽 to like</div>

      {/* Controls */}
      <div style={{ marginBottom: 20, display: "flex", gap: 10 }}>
        <button onClick={() => swipe("left")} style={{ padding: "10px 14px", borderRadius: 10, background: theme.button, border: "none" }}> 👎🏽 </button>
        <button onClick={() => swipe("right")} style={{ padding: "10px 14px", borderRadius: 10, background: theme.button, border: "none" }}> ❤️ </button>
      </div>
	  
      {/* Center column */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, maxWidth: 420, width: "92vw" }}>
        {/* Card stack container */}
        <div style={{ position: "relative", width: 340, maxWidth: "100%", height: 460 }}>
          {/* We must render bottom → top so top is last in DOM.
              visible currently contains [current, next, next2]; we reverse it for rendering.
          */}
          {visible
            .slice() // copy
            .reverse()
            .map((cat, revIndex) => {
              // revIndex=0 -> originally the last element in visible
              // compute the real index in cats
              const visibleLength = visible.length;
              const offsetFromTop = visibleLength - 1 - revIndex; // 0 = top card, 1 = next below, ...
              const realIndex = currentIndex + offsetFromTop;
              const isTop = offsetFromTop === 0;
              const zIndex = isTop ? 50 : 40 - offsetFromTop;
              const scale = isTop ? 1 : 0.96;
              const translateY = offsetFromTop * 8;

              return (
                <div
                  key={cat}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    margin: "0 auto",
                    width: "100%",
                    height: "100%",
                    zIndex,
                    transform: `translateY(${translateY}px) scale(${scale})`,
                    transition: "transform 220ms ease, opacity 220ms ease",
                    opacity: isTop ? 1 : 0.6,
                    pointerEvents: isTop ? "auto" : "none", // only top card receives pointer events
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TinderCard
                    ref={(el) => {
                      // assign the card instance to the correct realIndex position
                      childRefs.current[realIndex] = el;
                    }}
                    onSwipe={(dir) => handleSwipe(dir, realIndex)}
                    preventSwipe={["up", "down"]}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 14,
                        overflow: "hidden",
                        boxShadow: "0 18px 40px rgba(2,6,23,0.25)",
                        background: theme.surface,
                      }}
                    >
                      <img src={cat} alt={`cat-${realIndex}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    </div>
                  </TinderCard>
                </div>
              );
            })}
        </div>
        </div>
    </div>
  );
}