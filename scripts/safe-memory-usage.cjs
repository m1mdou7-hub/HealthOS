/**
 * Some sandboxed CI environments do not expose libuv's RSS syscall.
 * Next.js uses process.memoryUsage() for build telemetry, so the missing
 * optional metric can abort an otherwise valid build. Preserve every
 * available metric and fall back only when that syscall is unavailable.
 */
const originalMemoryUsage = process.memoryUsage.bind(process);
const originalRss = process.memoryUsage.rss?.bind(process.memoryUsage);

const fallback = () => ({
  rss: 0,
  heapTotal: process.memoryUsage.heapTotal?.() ?? 0,
  heapUsed: process.memoryUsage.heapUsed?.() ?? 0,
  external: 0,
  arrayBuffers: 0
});

const safeMemoryUsage = () => {
  try {
    return originalMemoryUsage();
  } catch (error) {
    if (error?.syscall !== 'uv_resident_set_memory') throw error;
    return fallback();
  }
};

safeMemoryUsage.rss = () => {
  try {
    return originalRss ? originalRss() : safeMemoryUsage().rss;
  } catch (error) {
    if (error?.syscall !== 'uv_resident_set_memory') throw error;
    return 0;
  }
};

process.memoryUsage = safeMemoryUsage;
