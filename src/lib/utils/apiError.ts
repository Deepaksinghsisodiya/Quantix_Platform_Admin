/**
 * The message an API failure actually carries, wherever the transport put it.
 *
 * RTK Query (axiosBaseQuery) rejects with `{ status, data }` where `data` is the API's
 * ErrorResponse body (`{ success:false, error:{ code, message } }` or a flat
 * `{ code, message }`), or a bare string when the request never reached the API. Axios
 * errors carry `message`. Callers pass the fallback they want shown when none of those
 * exist — never a bare "Error".
 */
export function apiErrorMessage(err: unknown, fallback: string): string {
  const e = err as {
    data?: { error?: { message?: string } | string; message?: string } | string;
    response?: { data?: { error?: { message?: string } | string; message?: string } | string };
    message?: string;
  } | null;
  // Raw axios errors (the fetch-style `lib/api/client` helpers) carry the body under
  // `response.data`; RTK Query unwraps it to `data`. A failed ApiResponse passed straight in
  // carries `message` at the top level.
  const data = e?.data ?? e?.response?.data;
  if (typeof data === 'string' && data.trim()) return data;
  if (data && typeof data === 'object') {
    const nested = data.error;
    if (typeof nested === 'string' && nested.trim()) return nested;
    if (nested && typeof nested === 'object' && nested.message) return nested.message;
    if (data.message) return data.message;
  }
  if (e?.message) return e.message;
  return fallback;
}
