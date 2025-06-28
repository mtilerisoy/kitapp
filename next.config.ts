const nextConfig = {
    outputFileTracingIncludes: {
        '/api/**/*': ['./api/**/*', './requirements.txt'],
    },
    images: {
        domains: ['randomuser.me'],
        remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      // You can add more domains here if needed
      // {
      //   protocol: 'https',
      //   hostname: 'another-domain.com',
      // },
    ],
    },
    rewrites: async () => {
        return [
            {
                source: '/api/:path*',
                destination:
                    process.env.NODE_ENV === 'development'
                        ? 'http://127.0.0.1:5328/api/:path*'
                        : '/api/',
            },
        ]
    },
}

export default nextConfig;
