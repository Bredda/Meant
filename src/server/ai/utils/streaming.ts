import { pushable } from "it-pushable";

/**
 * Merges the output of a dynamic number of concurrently running producers
 * into a single stream. The group closes once every forked task has
 * settled; a task that throws ends the whole stream with that error
 * (matching it-pushable's `end(error)` semantics: the error surfaces on
 * the consumer's `for await`/`yield*`, further pushes are silently
 * dropped instead of crashing).
 */
export type TaskGroup<T> = AsyncIterable<T> & {
  fork: (task: () => Promise<void>) => void;
  push: (value: T) => void;
};

export function createTaskGroup<T>(): TaskGroup<T> {
  const source = pushable<T>({ objectMode: true });
  let pending = 0;

  function fork(task: () => Promise<void>) {
    pending += 1;
    task()
      .catch((error: unknown) => {
        source.end(error instanceof Error ? error : new Error(String(error)));
      })
      .finally(() => {
        pending -= 1;
        if (pending === 0) {
          source.end();
        }
      });
  }

  return Object.assign(source, { fork });
}
