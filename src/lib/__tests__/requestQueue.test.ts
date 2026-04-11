import { describe, it, expect } from "vitest";
import { RequestQueue, withRetry } from "@/lib/requestQueue";

describe("RequestQueue", () => {
  it("enqueue executes task and returns result", async () => {
    const queue = new RequestQueue(5);
    const result = await queue.enqueue(() => Promise.resolve(42));
    expect(result).toBe(42);
  });

  it("propagates errors from tasks", async () => {
    const queue = new RequestQueue(5);
    await expect(
      queue.enqueue(() => Promise.reject(new Error("boom")))
    ).rejects.toThrow("boom");
  });

  it("respects concurrency limit", async () => {
    const queue = new RequestQueue(3);
    let maxConcurrent = 0;
    let currentConcurrent = 0;

    const task = () =>
      new Promise<void>((resolve) => {
        currentConcurrent++;
        if (currentConcurrent > maxConcurrent) maxConcurrent = currentConcurrent;
        setTimeout(() => {
          currentConcurrent--;
          resolve();
        }, 20);
      });

    await Promise.all(Array.from({ length: 10 }, () => queue.enqueue(task)));
    expect(maxConcurrent).toBe(3);
  });

  it("drains queued tasks in FIFO order", async () => {
    const queue = new RequestQueue(1);
    const order: number[] = [];

    const makeTask = (id: number) => () =>
      new Promise<void>((resolve) => {
        order.push(id);
        setTimeout(resolve, 5);
      });

    await Promise.all([
      queue.enqueue(makeTask(1)),
      queue.enqueue(makeTask(2)),
      queue.enqueue(makeTask(3)),
    ]);

    expect(order).toEqual([1, 2, 3]);
  });

  it("getStats returns active and queued counts", async () => {
    const queue = new RequestQueue(1);

    let resolveFirst!: () => void;
    const blockingTask = () => new Promise<void>((resolve) => { resolveFirst = resolve; });

    const p1 = queue.enqueue(blockingTask);
    queue.enqueue(() => Promise.resolve());
    queue.enqueue(() => Promise.resolve());

    await new Promise((r) => setTimeout(r, 0));

    const stats = queue.getStats();
    expect(stats.active).toBe(1);
    expect(stats.queued).toBe(2);

    resolveFirst();
    await p1;
  });
});

describe("withRetry", () => {
  it("returns result on success", async () => {
    const fn = withRetry(() => Promise.resolve("ok"));
    expect(await fn()).toBe("ok");
  });

  it("retries on 429 error", async () => {
    let calls = 0;
    const fn = withRetry(() => {
      calls++;
      if (calls < 3) {
        return Promise.reject({ status: 429, message: "rate limited" });
      }
      return Promise.resolve("recovered");
    }, 3);

    const result = await fn();
    expect(result).toBe("recovered");
    expect(calls).toBe(3);
  });

  it("retries on 403 with x-ratelimit-remaining: 0", async () => {
    let calls = 0;
    const fn = withRetry(() => {
      calls++;
      if (calls < 2) {
        return Promise.reject({
          status: 403,
          response: { headers: { "x-ratelimit-remaining": "0" } },
        });
      }
      return Promise.resolve("ok");
    }, 3);

    const result = await fn();
    expect(result).toBe("ok");
    expect(calls).toBe(2);
  });

  it("does not retry non-429 errors", async () => {
    let calls = 0;
    const fn = withRetry(() => {
      calls++;
      return Promise.reject({ status: 500, message: "server error" });
    }, 3);

    await expect(fn()).rejects.toEqual(
      expect.objectContaining({ status: 500 })
    );
    expect(calls).toBe(1);
  });

  it("throws after max retries exhausted", async () => {
    let calls = 0;
    const fn = withRetry(() => {
      calls++;
      return Promise.reject({ status: 429, message: "rate limited" });
    }, 2);

    await expect(fn()).rejects.toEqual(
      expect.objectContaining({ status: 429 })
    );
    expect(calls).toBe(3); // initial + 2 retries
  });

  it("respects x-ratelimit-reset header for delay", async () => {
    let calls = 0;
    const resetTime = Math.floor(Date.now() / 1000) + 1; // 1 second from now

    const fn = withRetry(() => {
      calls++;
      if (calls < 2) {
        return Promise.reject({
          status: 429,
          response: {
            headers: { "x-ratelimit-reset": String(resetTime) },
          },
        });
      }
      return Promise.resolve("ok");
    }, 3);

    const start = Date.now();
    const result = await fn();
    const elapsed = Date.now() - start;

    expect(result).toBe("ok");
    expect(elapsed).toBeGreaterThanOrEqual(1000);
  });
});
