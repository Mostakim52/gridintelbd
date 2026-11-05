import { useEffect, useRef, useState } from "react";

/**
 * Kairo draws reveal-driven pictures in their finished state under a `.kr-in`
 * ancestor. This flips that class on once the element scrolls into view, and
 * reveals immediately when IntersectionObserver is unavailable so content is
 * never left invisible.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, shown };
}

/** Pointer handler that feeds Kairo's card spotlight its cursor position. */
export function spot(event: React.PointerEvent<HTMLElement>) {
  const el = event.currentTarget;
  const rect = el.getBoundingClientRect();
  el.style.setProperty("--kr-mx", `${event.clientX - rect.left}px`);
  el.style.setProperty("--kr-my", `${event.clientY - rect.top}px`);
}
