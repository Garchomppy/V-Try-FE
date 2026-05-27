import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // MediaPipe scripts + WASM (needs unsafe-eval for WASM compilation)
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net",
              // MediaPipe model/WASM fetch + THREE.js blob textures + Anthropic API + HF Spaces (IDM-VTON)
              "connect-src 'self' blob: https://cdn.jsdelivr.net https://api.anthropic.com https://generativelanguage.googleapis.com https://*.hf.space https://huggingface.co https://api.gradio.app",
              // MediaPipe spawns blob: workers
              "worker-src 'self' blob:",
              // Webcam getUserMedia needs media-src (some browsers check this)
              "media-src 'self' blob: mediastream:",
              // Images from product photos / data URIs (snapshots) / blob canvas exports
              "img-src 'self' data: blob: https:",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' https://fonts.gstatic.com",
            ].join("; "),
          },
          // Permissions Policy to explicitly allow camera
          {
            key: "Permissions-Policy",
            value: "camera=*, microphone=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
