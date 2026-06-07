import { Redis } from "@upstash/redis";

/** Minimal KVNamespace shim backed by Upstash Redis. */
export function createUpstashKv(url: string, token: string): KVNamespace {
  const redis = new Redis({ url, token });
  return {
    async get(
      key: string,
      type?: "text" | "json" | "arrayBuffer" | "stream",
    ): Promise<string | unknown | ArrayBuffer | ReadableStream | null> {
      const value = await redis.get<string>(key);
      if (value === null || value === undefined) return null;
      if (type === "json") {
        try {
          return JSON.parse(value) as unknown;
        } catch {
          return value;
        }
      }
      return value;
    },
    async put(
      key: string,
      value: string | ArrayBuffer | ArrayBufferView | ReadableStream,
      options?: { expirationTtl?: number; expiration?: number; metadata?: unknown },
    ): Promise<void> {
      const payload = typeof value === "string" ? value : String(value);
      if (options?.expirationTtl) {
        await redis.set(key, payload, { ex: options.expirationTtl });
        return;
      }
      await redis.set(key, payload);
    },
    async delete(key: string): Promise<void> {
      await redis.del(key);
    },
    async list(): Promise<KVNamespaceListResult<unknown, string>> {
      return { keys: [], list_complete: true, cacheStatus: null };
    },
    async getWithMetadata(): Promise<KVNamespaceGetWithMetadataResult<string, unknown>> {
      throw new Error("getWithMetadata() not implemented for Upstash adapter");
    },
  } as unknown as KVNamespace;
}
