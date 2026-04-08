// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    'localhost:3000',
    '*.ngrok-free.dev',        // ini yang penting
    '*.ngrok.io',
    '127.0.0.1:3000'
  ],
};

module.exports = nextConfig;