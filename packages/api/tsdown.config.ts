import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/context.ts", "src/routers/index.ts", "src/jobs.ts"],
  sourcemap: true,
  dts: true,
});
