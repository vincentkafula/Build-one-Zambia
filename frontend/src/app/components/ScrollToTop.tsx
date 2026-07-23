import { useEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * React Router (client-side navigation) does not reset scroll position
 * between route changes the way a normal full-page browser navigation
 * does. Without this, clicking a link — e.g. a footer link to
 * "Presidential Results" or "Mayoral Results" — while scrolled down on
 * the current page lands the user at that same scroll offset on the new
 * page instead of at the top, so the candidates section (which sits near
 * the top of every results page) can end up hidden above the fold.
 *
 * Mounted once near the root, inside <BrowserRouter>, so it applies to
 * every route change across the whole app.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
