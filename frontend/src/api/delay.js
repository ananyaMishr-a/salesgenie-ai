// Simulates network latency for mock async calls in src/api/.
// Once real endpoints exist, this file (and its usages) simply gets deleted.
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
