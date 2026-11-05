import { useEffect, useState } from "react";

export type Route = "home" | "field";

const read = (): Route => {
  const raw = window.location.hash.replace(/^#\/?/, "").split("?")[0];
  return raw === "field" ? "field" : "home";
};

/**
 * Two routes, resolved from the hash. A hash router rather than a history
 * router because the build is served from static hosts (including GitHub
 * Pages project sub-paths) where a path-based route would 404 on refresh.
 */
export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(read);

  useEffect(() => {
    const onChange = () => {
      setRoute(read());
      window.scrollTo({ top: 0, behavior: "auto" });
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return route;
}

export const href = (route: Route) => (route === "field" ? "#/field" : "#/");
