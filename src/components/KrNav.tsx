import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { Bolt, Close, Menu } from "./Icons";
import { href, type Route } from "../lib/route";

type Props = { route: Route };

const LINKS: { route: Route; label: string }[] = [
  { route: "home", label: "Simulator" },
  { route: "field", label: "Field rig" },
];

export function KrNav({ route }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [route]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className={clsx("kr-nav", scrolled && "kr-scrolled")}>
      <div className="kr-container kr-nav-in">
        <a className="kr-brand" href="#/" aria-label="GridIntelBD home">
          <span className="kr-mark">
            <b>
              <Bolt size={15} />
            </b>
          </span>
          GridIntelBD
        </a>

        <nav className="kr-nav-links gs-nav-links" aria-label="Sections">
          {LINKS.map((link) => (
            <a
              key={link.route}
              href={href(link.route)}
              className={clsx(route === link.route && "is-on")}
              aria-current={route === link.route ? "page" : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="kr-nav-right">
          <a className="kr-btn kr-btn-accent" href="#simulator">
            Open the model
          </a>
          <button
            className="kr-menu-btn"
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="gs-mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <Close size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <div
        id="gs-mobile-menu"
        className={clsx("kr-mobile-menu", open && "kr-open")}
      >
        {LINKS.map((link) => (
          <a
            key={link.route}
            href={href(link.route)}
            className={clsx(route === link.route && "is-on")}
          >
            {link.label}
          </a>
        ))}
        <a className="kr-btn kr-btn-accent" href="#simulator">
          Open the model
        </a>
      </div>
    </header>
  );
}
