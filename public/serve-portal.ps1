# =============================================================================
#  Quantix Platform Admin - minimal static file server
#
#  Why this exists: the portal is a single-page app that browsers refuse to run
#  from a file:// path, so it needs an HTTP server. Rather than require Python,
#  Node or IIS on a test machine, this uses HttpListener, which ships with
#  Windows. Binding http://localhost:<port>/ does not need administrator rights.
#
#  It serves the folder it sits in, and returns index.html for any path that is
#  not a real file, because routes like /content/faq are handled inside the app
#  rather than by the server.
# =============================================================================

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = 3001

$mime = @{
  '.html' = 'text/html; charset=utf-8'
  '.js'   = 'text/javascript; charset=utf-8'
  '.mjs'  = 'text/javascript; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.svg'  = 'image/svg+xml'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.gif'  = 'image/gif'
  '.webp' = 'image/webp'
  '.ico'  = 'image/x-icon'
  '.woff' = 'font/woff'
  '.woff2'= 'font/woff2'
  '.ttf'  = 'font/ttf'
  '.map'  = 'application/json; charset=utf-8'
  '.txt'  = 'text/plain; charset=utf-8'
}

# Try a few ports rather than insisting on one. A port can be busy, but it can also be
# RESERVED by Windows itself: Hyper-V, WSL and Docker reserve dynamic ranges, and
# `netsh int ipv4 show excludedportrange protocol=tcp` will list them. A reserved port
# cannot be bound by anything, so failing on a single hardcoded port is a dead end the
# user cannot fix.
$candidates = @($port, 3002, 4173, 5173, 8080, 8081, 8800)
$listener = $null

foreach ($p in $candidates) {
  $try = New-Object System.Net.HttpListener
  $try.Prefixes.Add("http://localhost:$p/")
  try {
    $try.Start()
    $listener = $try
    $port = $p
    break
  } catch {
    $try.Close()
  }
}

if ($null -eq $listener) {
  Write-Host ""
  Write-Host "  Could not listen on any of: $($candidates -join ', ')" -ForegroundColor Red
  Write-Host ""
  Write-Host "  Those ports are in use or reserved by Windows. Check reservations with:"
  Write-Host "      netsh int ipv4 show excludedportrange protocol=tcp"
  Write-Host ""
  Write-Host "  Simplest alternative: use the API package instead. It already contains"
  Write-Host "  this portal and serves it at http://localhost:5104"
  Write-Host ""
  exit 1
}

Write-Host "  Serving $root" -ForegroundColor Green
Write-Host "  Open http://localhost:$port" -ForegroundColor Green
Write-Host ""

# Open the browser once the listener is definitely accepting connections.
Start-Process "http://localhost:$port" | Out-Null

try {
  while ($listener.IsListening) {
    $context  = $listener.GetContext()
    $request  = $context.Request
    $response = $context.Response

    try {
      $rel = [Uri]::UnescapeDataString($request.Url.AbsolutePath).TrimStart('/')
      if ([string]::IsNullOrWhiteSpace($rel)) { $rel = 'index.html' }

      # Resolve inside the served folder only: a request cannot escape it with ..
      $full = [IO.Path]::GetFullPath((Join-Path $root $rel))
      if (-not $full.StartsWith($root, [StringComparison]::OrdinalIgnoreCase)) {
        $response.StatusCode = 403
        $response.Close()
        continue
      }

      # Anything that is not a file on disk is an in-app route: serve index.html
      # and let the app resolve it, so a refresh on any page works.
      if (-not (Test-Path -LiteralPath $full -PathType Leaf)) {
        $full = Join-Path $root 'index.html'
      }

      $ext   = [IO.Path]::GetExtension($full).ToLowerInvariant()
      $bytes = [IO.File]::ReadAllBytes($full)

      $response.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
      # config.js is edited after deployment, so it must never be cached.
      if ([IO.Path]::GetFileName($full) -ieq 'config.js') {
        $response.Headers.Add('Cache-Control', 'no-store')
      }
      $response.ContentLength64 = $bytes.Length
      $response.OutputStream.Write($bytes, 0, $bytes.Length)
    } catch {
      $response.StatusCode = 500
    } finally {
      $response.Close()
    }
  }
} finally {
  $listener.Stop()
  $listener.Close()
}
