import { ContextProvider } from '@lit/context';
import {html, literal} from 'lit/static-html.js';
import { LitElement, css } from 'lit-element';

import * as url from 'url';
import * as styles from 'styles';
import { context } from 'context';

import { Api } from  'api';
import 'pages/event-browser';

export class Logdk extends LitElement {
	_context = new ContextProvider(this, context);

	static properties = {
		_component: {state: true}
	};

	constructor() {
		super();
		const api = new Api();
		this._context.setValue({api: api});
		this.route(top.location.pathname, false);
	}

	connectedCallback() {
		super.connectedCallback();
		window.addEventListener('click', this.click.bind(this));
		window.addEventListener('popstate', this.popstate.bind(this));
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		window.removeEventlistener('click', this.click.bind(this));
		window.removeEventlistener('popstate', this.popstate.bind(this));
	}

	click(e) {
		const event_path = event.composedPath();
		const target = event_path[0];
		if (target.tagName !== 'A' || target.dataset.wc === undefined) return;

		const pathname = target.pathname;
		if (this.route(pathname, true)) {
			e.preventDefault();
			e.stopPropagation();
		}
	}

	popstate() {
		this.route(top.location.pathname);
	}

	route(path, push) {
		let component = null;
		switch (path) {
		case '':
		case '/':
			component = literal`event-browser`;
		}

		if (component == null) return false;
		if (push) history.pushState(null, '', path);

		if (this._component && this._component.r == component.r) {
			const c = this.renderRoot?.querySelector(component['_$litStatic$']);
			if (c.popstate) c.popstate();
		} else {
			this._component = component;
		}
		return true;
	}

	render() {
		return html`
			<header><nav><ul>
				<li><a href="/" data-wc>home</a>
			</ul></nav></header>
			<${this._component}></${this._component}>
		`;
	}

	static styles = [
		styles.reset,
		css`
			header {
				padding: 0 20px;
				background: #fff;
				border-bottom: 1px solid #ff79c6;
			}
			li {
				display: inline-block;
			}
			a {
				color: #222;
				line-height: 40px;
				padding: 0 20px;
				display: inline-block;
			}
			a:hover {
				color: #fff;
				background: #ff79c6;
			}
		`
	];
}
customElements.define('logdk-app', Logdk);
