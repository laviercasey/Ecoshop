import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
        }),
        react(),
        tailwindcss(),
        VitePWA({
            registerType: 'autoUpdate',
            manifest: {
                name: 'EcoShop',
                short_name: 'EcoShop',
                theme_color: '#16a34a',
                background_color: '#ffffff',
                display: 'standalone',
                icons: [
                    {
                        src: '/icons/icon-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: '/icons/icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                ],
            },
        }),
    ],
    resolve: {
        alias: {
            '@app': path.resolve(__dirname, 'resources/js/app'),
            '@pages': path.resolve(__dirname, 'resources/js/pages'),
            '@widgets': path.resolve(__dirname, 'resources/js/widgets'),
            '@features': path.resolve(__dirname, 'resources/js/features'),
            '@entities': path.resolve(__dirname, 'resources/js/entities'),
            '@shared': path.resolve(__dirname, 'resources/js/shared'),
        },
    },
    server: {
        host: '0.0.0.0',
        origin: 'http://localhost:5173',
        cors: {
            origin: ['http://localhost', 'http://localhost:80'],
        },
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
