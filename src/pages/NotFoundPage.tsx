import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Round_16 Pass 3 audit C-8 / M2: explicit 404 page replaces the prior catch-all redirect to
 * /dashboard which masked typos and broken links and made debugging painful.
 */
export function NotFoundPage() {
  return (
    <div
      role="main"
      className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center"
    >
      <div className="text-7xl font-bold tracking-tight text-gray-300 dark:text-gray-700">
        404
      </div>
      <h1 className="mt-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">
        Page not found
      </h1>
      <p className="mt-2 max-w-md text-sm text-gray-600 dark:text-gray-400">
        The link you followed may be broken, or the page may have been moved or deleted.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          to="/dashboard"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          Go to Dashboard
        </Link>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Go back
        </button>
      </div>
    </div>
  );
}
