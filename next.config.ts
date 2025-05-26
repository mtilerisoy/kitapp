const nextConfig = {
    outputFileTracingIncludes: {
        '/api/**/*': ['./api/**/*', './requirements.txt'],
    },
    images: {
        domains: ['randomuser.me'],
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
