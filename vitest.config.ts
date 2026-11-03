import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@\/convex\//, replacement: `${root}convex/` },
      { find: /^@\/lib\//, replacement: `${root}src/libs/` },
      { find: "@", replacement: `${root}src` },
    ],
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
