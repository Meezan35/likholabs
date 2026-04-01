import type { NextConfig } from "next";

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://challenges.cloudflare.com https://hcaptcha.com https://*.hcaptcha.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://img.clerk.com https://hcaptcha.com https://*.hcaptcha.com;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.openai.com https://*.clerk.accounts.dev https://api.clerk.com https://challenges.cloudflare.com https://hcaptcha.com https://*.hcaptcha.com;
  frame-src 'self' https://*.clerk.accounts.dev https://challenges.cloudflare.com https://hcaptcha.com https://*.hcaptcha.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self' https://*.clerk.accounts.dev;
`
  .replace(/\s{2,}/g, ' ')
  .trim()

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy,
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ]
  },
}

export default nextConfig
