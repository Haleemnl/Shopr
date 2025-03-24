/** @type {import('next').NextConfig} */
const nextConfig = {

    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'gxnkdnidewytyzcmwopw.supabase.co',
                port: '',
                pathname: '/storage/v1/object/public/**',
                search: '',
            },
        ],

    }
};

export default nextConfig;
