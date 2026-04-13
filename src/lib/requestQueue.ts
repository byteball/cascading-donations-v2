interface QueuedTask<T = unknown> {
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
}

export class RequestQueue {
  private maxConcurrent: number;
  private maxQueueSize: number;
  private taskTimeoutMs: number;
  private activeCount = 0;
  private queue: QueuedTask[] = [];

  constructor(maxConcurrent: number, maxQueueSize = 200, taskTimeoutMs = 10_000) {
    this.maxConcurrent = maxConcurrent;
    this.maxQueueSize = maxQueueSize;
    this.taskTimeoutMs = taskTimeoutMs;
  }

  enqueue<T>(fn: () => Promise<T>): Promise<T> {
    if (this.queue.length >= this.maxQueueSize) {
      console.error(`requestQueue: queue overflow — ${this.queue.length} queued, ${this.activeCount} active, rejecting new task`);
      return Promise.reject(new Error("requestQueue: queue overflow"));
    }

    return new Promise<T>((resolve, reject) => {
      this.queue.push({ fn, resolve, reject } as QueuedTask);
      if (this.queue.length > 50) {
        console.warn(`requestQueue: high queue depth: ${this.queue.length} queued, ${this.activeCount} active`);
      }
      this.drain();
    });
  }

  private drain() {
    while (this.activeCount < this.maxConcurrent && this.queue.length > 0) {
      const task = this.queue.shift()!;
      this.activeCount++;

      let timedOut = false;
      const timer = setTimeout(() => {
        timedOut = true;
        console.error(`requestQueue: task timed out after ${this.taskTimeoutMs}ms`);
        task.reject(new Error("requestQueue: task timeout"));
        this.activeCount--;
        this.drain();
      }, this.taskTimeoutMs);

      task
        .fn()
        .then((value) => { if (!timedOut) task.resolve(value); })
        .catch((err) => { if (!timedOut) task.reject(err); })
        .finally(() => {
          clearTimeout(timer);
          if (!timedOut) {
            this.activeCount--;
            this.drain();
          }
        });
    }
  }

  getStats() {
    return { active: this.activeCount, queued: this.queue.length };
  }
}

let instance: RequestQueue | null = null;

export function getRequestQueue(): RequestQueue {
  if (!instance) {
    instance = new RequestQueue(80);
  }
  return instance;
}

// --- retry helper ---

function is429Error(err: unknown): boolean {
  if (err && typeof err === "object") {
    const status = (err as { status?: number }).status;
    if (status === 429) return true;

    // GitHub returns 403 with x-ratelimit-remaining: 0 when rate limited
    if (status === 403) {
      const headers = (err as { response?: { headers?: Record<string, string> } }).response?.headers;
      if (headers && headers["x-ratelimit-remaining"] === "0") return true;
    }
  }
  return false;
}

function getRetryDelay(err: unknown, attempt: number): number {
  // check x-ratelimit-reset header (GitHub returns epoch seconds)
  if (err && typeof err === "object") {
    const headers = (err as { response?: { headers?: Record<string, string> } }).response?.headers;
    const resetTs = headers?.["x-ratelimit-reset"];
    if (resetTs) {
      const delayMs = (Number(resetTs) * 1000) - Date.now();
      if (delayMs > 0 && delayMs < 10_000) {
        return delayMs + 1000; // +1s buffer
      }
    }
  }

  // exponential backoff with jitter, capped at 10s
  const base = 1000 * Math.pow(2, attempt);
  const jitter = Math.random() * 1000;
  return Math.min(base + jitter, 10_000);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 2
): () => Promise<T> {
  return async () => {
    let lastError: unknown;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        if (is429Error(err) && attempt < maxRetries) {
          const delay = getRetryDelay(err, attempt);
          console.log(`requestQueue: rate limited, retrying in ${Math.round(delay / 1000)}s (attempt ${attempt + 1}/${maxRetries})`);
          await sleep(delay);
          continue;
        }
        throw err;
      }
    }
    console.error(`requestQueue: all retries exhausted after ${maxRetries} attempts`, lastError);
    throw lastError;
  };
}
