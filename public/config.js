// =============================================================================
//  Quantix Platform Admin  -  RUNTIME CONFIGURATION
// -----------------------------------------------------------------------------
//  This file is loaded by index.html BEFORE the React bundle. Any values set
//  on window.__QUANTIX_CONFIG__ here override the build-time VITE_* env vars.
//
//  It lives outside the bundle (Vite copies /public/* to dist/ unchanged), so
//  you can edit it AFTER the SPA has been built/published to point the portal
//  at a different API or toggle mock mode -- NO REBUILD NEEDED.
//
//  Operators / testers: edit this file in your dist/ (or extracted-zip) folder.
//  Restart the host (or hard-refresh the browser) for changes to take effect.
// =============================================================================

window.__QUANTIX_CONFIG__ = {
  // Base URL of the Quantix Platform API the SPA should call.
  // Default matches the PlatformAPI local tester (http://localhost:5104).
  // For staging / production set this to the publicly reachable API origin.
  apiBaseUrl: "http://localhost:5104",

  // When true the SPA wires MSW (Mock Service Worker) and serves canned
  // responses from src/lib/api/mock/mockHandlers.ts instead of hitting a real
  // API. Leave false for end-to-end tester runs.
  mockApi: false,

  // Display name shown in the page title bar (override if you brand the portal).
  appName: "Quantix Platform Admin",

  // MFA issuer string baked into TOTP QR codes during MFA enrolment.
  mfaIssuer: "Quantix Platform",
};
