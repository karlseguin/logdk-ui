import { unsafeStatic, literal } from 'lit/static-html.js';

export class Router {
	constructor(container) {
		this._container = container;
		this._title = 'logdk';
		this._child = null;
		this._component = null;
	}

	connect() {
		window.addEventListener('click', this.click.bind(this));
		window.addEventListener('popstate', this.popstate.bind(this));
	}

	disconnect() {
		window.removeEventListener('click', this.click.bind(this));
		window.removeEventListener('popstate', this.popstate.bind(this));
	}

	click(e) {
		const event_path = event.composedPath();
		const target = event_path[0];
		if (target.tagName !== 'A' || target.dataset.wc === undefined) return;

		this.route(target.pathname, true);
		e.preventDefault();
		e.stopPropagation();
		this._container.update();
	}

	popstate() {
		this.route(null, false);
	}

	render() {
		document.title = 'logdk - ' + this._title;
		return [this._component, literal`${unsafeStatic(this._component)}`];
	}

	renderChild() {
		return [this._child, literal`${unsafeStatic(this._child)}`];
	}

	route(path, push) {
		if (path === null) path = top.location.pathname;
		const result = this._container.route(path);

		if (result === null) {
			this._title = 'not found';
			this._component = 'logdk-notfound';
			return;
		}
		if (push) history.pushState(null, '', path);

		this._title = result.title;
		this._child = result.child ?? null;
		const component = result.component;
		if (this._component === component) {
			const c = this._container.renderRoot.querySelector(component);
			if (c.popstate) c.popstate();
		} else {
			this._component = component;
		}
	}
};
