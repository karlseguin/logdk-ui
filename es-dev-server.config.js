const path = require('path');
const proxy = require('koa-proxies');

module.exports = {
	debug: false,
	port: 8000,
	hostname: '127.0.0.1',
	watch: true,
	plugins: [],
	nodeResolve: true,
	appIndex: 'index.html',
	moduleDirs: ['node_modules', 'src'],
	middlewares: [
		proxy('/api', {
			target: 'http://localhost:7714',
		}),
	],
};
