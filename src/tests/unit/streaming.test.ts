import { expect, test } from "vitest";
import { createTaskGroup } from "@/server/ai/utils/streaming";

async function collect<T>(iterable: AsyncIterable<T>): Promise<T[]> {
  const values: T[] = [];
  for await (const value of iterable) {
    values.push(value);
  }
  return values;
}

test("closes once every forked task settles", async () => {
  const group = createTaskGroup<number>();

  group.fork(() => {
    group.push(1);
    return Promise.resolve();
  });
  group.fork(() => {
    group.push(2);
    return Promise.resolve();
  });

  const values = await collect(group);

  expect(values.sort()).toEqual([1, 2]);
});

test("supports nested forks (fork called from within a forked task)", async () => {
  const group = createTaskGroup<string>();

  group.fork(() => {
    group.push("outer-start");
    group.fork(() => {
      group.push("inner");
      return Promise.resolve();
    });
    group.push("outer-end");
    return Promise.resolve();
  });

  const values = await collect(group);

  expect(values).toContain("outer-start");
  expect(values).toContain("outer-end");
  expect(values).toContain("inner");
  expect(values).toHaveLength(3);
});

test("propagates an error from a forked task to the consumer", async () => {
  const group = createTaskGroup<number>();

  group.fork(() => {
    group.push(1);
    return Promise.reject(new Error("boom"));
  });
  group.fork(() => {
    group.push(2);
    return Promise.resolve();
  });

  await expect(collect(group)).rejects.toThrow("boom");
});

test("silently drops pushes from other tasks after an error ends the group", async () => {
  const group = createTaskGroup<number>();
  let secondTaskFinished = false;

  group.fork(() => Promise.reject(new Error("boom")));
  group.fork(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    group.push(2);
    secondTaskFinished = true;
  });

  await expect(collect(group)).rejects.toThrow("boom");
  await new Promise((resolve) => setTimeout(resolve, 20));
  expect(secondTaskFinished).toBe(true);
});
