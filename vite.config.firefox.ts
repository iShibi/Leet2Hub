import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

function copyManifestPlugin() {
	return {
		name: 'copy-manifest',
		async writeBundle() {
			const srcPath = resolve(__dirname, 'src/manifest.firefox.json');
			const destPath = resolve('dist/firefox/manifest.json');

			try {
				const content = await readFile(srcPath, 'utf8');
				await writeFile(destPath, content);
				console.log('dist/firefox/manifest.json');
			} catch (err) {
				console.error('Failed to copy manifest:', err);
			}
		},
	};
}

// https://vite.dev/config/
export default defineConfig({
	plugins: [preact(), tailwindcss(), copyManifestPlugin()],
	build: {
		outDir: 'dist/firefox',
		emptyOutDir: true,
		rollupOptions: {
			input: {
				popup: resolve(__dirname, 'src/popup/popup.html'),
				options: resolve(__dirname, 'src/options/options.html'),
				ServiceWorker: resolve(__dirname, 'src/ServiceWorker.ts'),
				Content: resolve(__dirname, 'src/Content.ts'),
			},
			output: {
				assetFileNames: assetInfo => {
					if (assetInfo.names[0].endsWith('.css')) {
						return 'assets/output.css';
					}
					return 'assets/[name].[hash][extname]';
				},
				entryFileNames: entryInfo => {
					if (['ServiceWorker', 'Content'].includes(entryInfo.name)) {
						return '[name].js';
					}
					return 'src/[name]/[name].js';
				},
				chunkFileNames: 'chunks/[name].js',
			},
		},
	},
});
