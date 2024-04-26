import { createSpaConfig } from '@open-wc/building-rollup';

const config = createSpaConfig({
	workbox: false,
	outputDir: 'dist',
	developmentMode: false,
	injectServiceWorker: false,
	legacyBuild: false,
	polyfillsLoader: false,
	nodeResolve: {
		preferBuiltins: false,
		customResolveOptions: {
			moduleDirectory: ['node_modules', 'src'],
		}
	},
});

config.input = './index.html';
export default config;
