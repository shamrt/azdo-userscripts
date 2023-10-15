/**
 * Waits until the given condition is true before resolving the promise.
 * @param condition The condition to wait for.
 * @returns A promise that resolves when the condition is true.
 */
export function waitUntil(condition) {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (condition()) {
        clearInterval(interval);
        resolve(void 0);
      }
    }, 100);
  });
}
