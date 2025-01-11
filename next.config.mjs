import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,  // This should be part of Next.js general configuration

  webpack: (config, { isServer }) => {
    // Ensure webpack resolves .ts and .tsx extensions
    config.resolve.extensions.push('.ts', '.tsx');

    // Polyfill node.js modules (like 'fs') only on client-side
    if (!isServer) {
      config.resolve.fallback = { fs: false };
    }

    // Add necessary plugins
    config.plugins.push(
      new NodePolyfillPlugin(), 
      new CopyPlugin({
        patterns: [
          {
            from: './node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.wasm',
            to: 'static/chunks/pages',
          },
          {
            from: './node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.jsep.wasm',
            to: 'static/chunks/pages',
          },
          {
            from: './src/model',
            to: 'static/chunks/pages',
          },
        ],
      })
    );

    return config;
  },
};

export default withPWA({
  dest: 'public',
})(nextConfig);
