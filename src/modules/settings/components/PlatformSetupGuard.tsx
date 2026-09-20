/**
 * PlatformSetupGuard — 2026-08-07 first-run gate.
 *
 * Until the one-time platform setup (deployment country et al.) is completed in
 * Global Settings, every staff screen except /settings redirects there. Login,
 * change-password, and MFA setup live outside the staff shell and are unaffected.
 *
 * 2026-08-31 / resolved 2026-09-04: this gate could hang the ENTIRE portal. It
 * rendered a full-screen spinner while `isLoading` was true and had no other exit.
 * The reason the query "never resolved" turned out to be RTK's autoBatchEnhancer
 * queuing RTK Query notifications on requestAnimationFrame, which never runs in a
 * document that is not being painted (background tab, hidden webview) — see
 * app/store.ts, where it is now configured to notify on a microtask instead. In a
 * visible tab the query resolved normally, which is why operators never met the
 * hang.
 *
 * The bounded wait stays regardless: a first-run check must never be able to lock
 * an operator out of the product it gates — a slow or failing settings call is a
 * real possibility. After GRACE_MS the guard stops blocking, lets the app through,
 * and says so rather than failing silently. It still redirects to /settings when
 * the API positively reports an unconfigured platform.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useGetSetupStatusQuery } from '../services/settingsApi';

/** How long the gate may block the whole portal before it gives up and opens. */
const GRACE_MS = 4000;

export const PlatformSetupGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { data, isLoading, isError } = useGetSetupStatusQuery();
  const [waitedTooLong, setWaitedTooLong] = React.useState(false);

  React.useEffect(() => {
    if (!isLoading) {
      setWaitedTooLong(false);
      return;
    }
    const timer = setTimeout(() => setWaitedTooLong(true), GRACE_MS);
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (isLoading && !waitedTooLong) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const isConfigured = data?.data?.isConfigured ?? true; // fail-open on fetch error — don't brick the app
  if (!isConfigured && location.pathname !== '/settings') {
    return <Navigate to="/settings" replace />;
  }

  // The setup check did not answer in time (or failed). Let the operator work, but
  // say so — a silent pass would hide a real connectivity or wiring problem.
  const unresolved = isError || (isLoading && waitedTooLong);

  return (
    <>
      {unresolved && (
        <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>
            The platform setup check did not complete. Continuing without it — if this
            deployment has not been set up yet, open Global Settings to finish first-run setup.
          </span>
        </div>
      )}
      {children}
    </>
  );
};

export default PlatformSetupGuard;
