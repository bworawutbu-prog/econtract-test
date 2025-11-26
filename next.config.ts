import type { NextConfig } from "next";

// ✅ Merged configuration จาก next.config.ts และ next.config.mjs
const nextConfig: NextConfig = {

  // Redirects 
  turbopack: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/login",
        permanent: true,
      },
      {
        source: "/home",
        destination: "/login",
        permanent: true,
      },
    ];
  },

  // Headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Referrer-Policy",
            value: "no-referrer-when-downgrade",
          },
        ],
      },
      {
        // Ensure CSS files are served with correct MIME type
        source: "/_next/static/css/:path*",
        headers: [
          {
            key: "Content-Type",
            value: "text/css; charset=utf-8",
          },
        ],
      },
      {
        // Ensure JS files are served with correct MIME type
        source: "/_next/static/chunks/:path*",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
        ],
      },
      {
        // Ensure all static assets in _next are served correctly
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            // 🎯 FIXED: Disable cache in development, enable in production
            value: process.env.NODE_ENV === 'development' 
              ? "no-cache, no-store, must-revalidate" 
              : "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Image Optimization
  images: {
    domains: [
      "dev-digitrust.softway.co.th",
      "digitract.one.th"
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400,
  },

  // Experimental Features
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'antd',
      'lucide-react',
      '@dnd-kit/core',
      'react-pdf',
      'pdf-lib',
      'jspdf',
      'fabric'
    ],
    // ✅ Add performance optimizations
   
    // Enable faster builds
    // swcMinify: true,
    // Optimize bundle size
    // bundlePagesRouterDependencies: true,
  },

  // Performance & Optimization
  compress: true,
  reactStrictMode: true,
  poweredByHeader: false,

  // Transpile Packages
  transpilePackages: [
    '@ant-design/v5-patch-for-react-19',
    '@dnd-kit/core',
    'react-pdf',
    'thai-address-autocomplete-react',
  ],

  // Webpack Configuration
  webpack: (config: any, { dev, isServer }: { dev: boolean; isServer: boolean }) => {
    // 🎯 FIXED: Disable webpack cache in development to ensure code updates
    if (dev) {
      config.cache = false; // Disable webpack cache in development
    }
    
    // Bundle Analyzer (เปิดเมื่อต้องการวิเคราะห์)
    if (process.env.ANALYZE === 'true') {
      config.plugins.push(
        new (require('@next/bundle-analyzer')({
          enabled: true,
        }))()
      );
    }

    // Production Optimizations
    if (!dev && !isServer) {
      // Advanced Bundle Splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          // Vendor chunks
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            maxSize: 244000,
          },
          // UI Library
          antd: {
            test: /[\\/]node_modules[\\/]antd[\\/]/,
            name: 'antd',
            chunks: 'all',
            priority: 20,
            maxSize: 244000,
          },
          // Icons
          lucide: {
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            name: 'lucide',
            chunks: 'all',
            priority: 15,
            maxSize: 100000,
          },
          // PDF Libraries
          pdf: {
            test: /[\\/]node_modules[\\/](react-pdf|pdfjs-dist|pdf-lib)[\\/]/,
            name: 'pdf-libs',
            chunks: 'all',
            priority: 25,
            maxSize: 300000,
          },
          fabric: {
            test: /[\\/]node_modules[\\/]fabric[\\/]/,
            name: 'fabric',
            chunks: 'all',
            priority: 25,
            maxSize: 200000,
          },
          jspdf: {
            test: /[\\/]node_modules[\\/]jspdf[\\/]/,
            name: 'jspdf',
            chunks: 'all',
            priority: 25,
            maxSize: 200000,
          },
          // HTTP Client
          axios: {
            test: /[\\/]node_modules[\\/]axios[\\/]/,
            name: 'axios',
            chunks: 'all',
            priority: 25,
            maxSize: 200000,
          },
          // Common chunks
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
            maxSize: 244000,
          },
        },
      };

      // Tree Shaking
      config.optimization.usedExports = true;
      config.optimization.sideEffects = "flag";
    }

    // HMR Configuration (Development)
    if (!isServer && dev) {
      const hmrRule = config.module.rules.find(
        (rule: any) => rule.test && rule.test.toString().includes('hot-middleware')
      );

      if (hmrRule) {
        config.devServer = {
          client: {
            webSocketTransport: 'sockjs',
          },
        };
      }
    }

    return config;
  },
};

export default nextConfig;
