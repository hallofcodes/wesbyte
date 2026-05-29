/** @type {import('next').NextConfig} */
const ContentSecurityPolicy = `
  default-src 'self';
  base-uri 'self';
  object-src 'none';
  frame-ancestors 'none';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https://images.pexels.com;
  font-src 'self' data: https://fonts.gstatic.com;
  worker-src 'self' blob:;
`.replace(/\n/g, '');
/*
const ContentSecurityPolicy = `
  default-src 'self';

  base-uri 'self';
  object-src 'none';

  frame-ancestors 'none';

  script-src
    'self'
    'unsafe-inline'
    'unsafe-eval'
    https://www.gstatic.com;
    https://cdn.jsdelivr.net; 

  style-src
    'self'
    'unsafe-inline';

  img-src
    'self'
    data:
    https://images.pexels.com;

  font-src
    'self'
    data:
    https://fonts.gstatic.com;

  worker-src 'self' blob:;
`.replace(/\n/g, "");
*/
const nextConfig = {
  images: { unoptimized: true },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "Content-Security-Policy",
          value: ContentSecurityPolicy,
        },
        {
          key: "X-Frame-Options",
          value: "SAMEORIGIN",
        },
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
        },
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains; preload",
        },
      ],
    },
  ],
};

module.exports = nextConfig;
