import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Traces only the files actually needed at runtime into .next/standalone —
  // required for the Dockerfile's minimal runner stage.
  output: "standalone",
};

export default nextConfig;
