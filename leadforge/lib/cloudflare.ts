import { getCloudflareContext } from "@opennextjs/cloudflare";

/** Runtime Cloudflare bindings (D1, KV, Queue) + env vars. */
export function getEnv(): CloudflareEnv {
  return getCloudflareContext().env as unknown as CloudflareEnv;
}

/** Schedule background work that outlives the response (queue-less local drive). */
export function waitUntil(promise: Promise<unknown>): void {
  try {
    getCloudflareContext().ctx.waitUntil(promise);
  } catch {
    // No execution context (e.g. some dev paths) — let it run detached.
    void promise;
  }
}
