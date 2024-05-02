import {rollupPluginHTML} from '@web/rollup-plugin-html';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import summary from 'rollup-plugin-summary';

export default {
	plugins: [
		rollupPluginHTML({input: 'index.html', extractAssets: false}),
		resolve({
			preferBuiltins: false,
			moduleDirectories: ['node_modules', 'src'],
		}),
		minifyHTML.default(),
		terser({ecma: 2021, module: true, warnings: true}),
		summary(),
	],
	output: {dir: 'dist'},
	preserveEntrySignatures: 'strict',
};
