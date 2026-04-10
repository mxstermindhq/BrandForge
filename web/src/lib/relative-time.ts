/** Relative time for "Posted … ago" labels (ISO 8601 from API). */

export function formatPostedAgo(iso: string | null | undefined): string | null {
  if (!iso || typeof iso !== "string") return null;
  const t = new Date(iso.trim()).getTime();
  if (!Number.isFinite(t)) return null;

  let sec = Math.floor((Date.now() - t) / 1000);
  if (sec < 0) sec = 0;
  if (sec < 10) return "Posted just now";
  if (sec < 60) return `Posted ${sec} seconds ago`;

  const min = Math.floor(sec / 60);
  if (min < 60) return min === 1 ? "Posted 1 minute ago" : `Posted ${min} minutes ago`;

  const hr = Math.floor(min / 60);
  if (hr < 24) return hr === 1 ? "Posted 1 hour ago" : `Posted ${hr} hours ago`;

  const day = Math.floor(hr / 24);
  if (day < 7) return day === 1 ? "Posted 1 day ago" : `Posted ${day} days ago`;

  const wk = Math.floor(day / 7);
  if (wk < 5) return wk === 1 ? "Posted 1 week ago" : `Posted ${wk} weeks ago`;

  const approxMo = Math.floor(day / 30);
  if (approxMo < 12) return approxMo <= 1 ? "Posted 1 month ago" : `Posted ${approxMo} months ago`;

  const approxYr = Math.floor(day / 365);
  return approxYr <= 1 ? "Posted 1 year ago" : `Posted ${approxYr} years ago`;
}

/** Same relative deltas as `formatPostedAgo`, with a custom verb prefix (e.g. Registered, Listed). */
export function formatEventAgo(iso: string | null | undefined, verb: string): string | null {
  const posted = formatPostedAgo(iso);
  if (!posted) return null;
  const v = verb.trim() || "Posted";
  return posted.replace(/^Posted /, `${v} `);
}

/** Same deltas as `formatPostedAgo`, with “Last active …” copy (profiles, not listings). */
export function formatLastActiveAgo(iso: string | null | undefined): string | null {
  const posted = formatPostedAgo(iso);
  if (!posted) return null;
  return posted.replace(/^Posted /, "Last active ");
}
