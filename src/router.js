import { Router } from '@vaadin/router';
import 'logdk';

const routes = [{
	path: '/',
	component: 'logdk-app',
	children: [
	// 	path: 'blog',
	// 	component: 'lit-blog',
	// 	action: async () => { await import('./blog/blog'); },
	// 	children: [{
	// 		path: 'posts',
	// 		component: 'lit-blog-posts',
	// 		action: async () => { await import('./blog/blog-posts'); }
	// 	},{
	// 		path: 'posts/:id',
	// 		component: 'lit-blog-post',
	// 		action: async () => { await import('./blog/blog-post'); },
	// 	}],
	// }, {
		{
			path: '/docs/api',
			component: 'docs-api',
			action: async () => { await import('./pages/docs/api'); },
		}
	]
}];

export const router = new Router(app);
router.setRoutes(routes);
