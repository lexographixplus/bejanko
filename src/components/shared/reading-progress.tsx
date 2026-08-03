"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const body = document.querySelector(".essay-body");
    if (!body) return;

    const onScroll = () => {
      const rect = body.getBoundingClientRect();
      const total = rect.height;
      const scrolled = Math.max(0, -rect.top);
      const pct = Math.min(1, scrolled / (total - window.innerHeight));
      setProgress(pct);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="reading-progress"
      style={{ transform: `scaleX(${progress})` }}
      role="presentation"
    />
  );
}
