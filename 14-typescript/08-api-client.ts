/**
 * Module 14 — 14.14 Typed ApiClient (generics + literals + retry)
 * A fully typed client: generic request<T>, RequestOptions with a
 * literal method union, and retry<T>. Runs offline via a typed fetch
 * mock built with setTimeout — no network needed.
 *
 * Run: npx tsx 08-api-client.ts
 */

// ---- Typed fetch mock (offline runtime stand-in for global fetch) ----
type JsonValue = Record<string, unknown> | unknown[] | string | number | boolean | null;

async function fakeFetch(url: string, init?: { method?: string; body?: string }): Promise<{
  ok: boolean;
  status: number;
  json: () => Promise<JsonValue>;
}> {
  await new Promise((r) => setTimeout(r, 10)); // simulate latency
  const body: JsonValue = url.endsWith("/post/1")
    ? { id: 1, title: "TS" }
    : { items: [{ id: 1, title: "TS" }, { id: 2, title: "JS" }] };
  return {
    ok: true,
    status: 200,
    json: async () => body,
  };
}

// ---- The ApiClient ----

interface Post {
  id: number;
  title: string;
}

interface RequestOptions<B = never> {
  method?: "GET" | "POST" | "PUT" | "DELETE"; // literal union
  headers?: Record<string, string>;
  body?: B;
  timeoutMs?: number;
}

class ApiClient {
  constructor(private baseUrl: string) {}

  private async request<T, B = never>(path: string, opts: RequestOptions<B> = {}): Promise<T> {
    const method = opts.method ?? "GET";
    const init: { method?: string; headers?: Record<string, string>; body?: string } = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(opts.headers ?? {}),
      },
    };
    if (opts.body !== undefined) {
      init.body = JSON.stringify(opts.body);
    }
    const res = await fakeFetch(`${this.baseUrl}${path}`, init);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} on ${method} ${path}`);
    }
    return (await res.json()) as T;
  }

  // retry<T>: re-invokes the request until attempts run out
  private async retry<T>(fn: () => Promise<T>, attempts = 3, delayMs = 20): Promise<T> {
    let lastErr: unknown;
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (err) {
        lastErr = err;
        if (i < attempts - 1) await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
      }
    }
    throw lastErr;
  }

  get<T>(path: string): Promise<T> {
    return this.retry(() => this.request<T>(path));
  }

  post<T, B>(path: string, body: B): Promise<T> {
    return this.request<T, B>(path, { method: "POST", body });
  }
}

// ---- Usage demo ----

async function main(): Promise<void> {
  const api = new ApiClient("https://jsonplaceholder.local");

  const post: Post = await api.get<Post>("/post/1");
  console.log("GET  /post/1        ->", post);

  const list: { items: Post[] } = await api.get<{ items: Post[] }>("/posts");
  console.log("GET  /posts         ->", list.items.length, "items");

  const created: Post = await api.post<Post, { title: string }>("/posts", {
    title: "New post",
  });
  console.log("POST /posts         ->", created);

  // Compile-time wins (would NOT compile if uncommented):
  // api.post<Post, { title: string }>("/posts", 42);        // 42 not an object
  // api.get<Post>("/post/1").then(p => p.nonexistent);      // unknown key
  // new ApiClient("x").get<Post>(undefined as never);       // path must be string
}

main().catch((err) => {
  console.error("client failed:", err);
});