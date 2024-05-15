import { ContextProvider } from '@lit/context';
import {html, literal, unsafeStatic} from 'lit/static-html.js';
import { LitElement, css } from 'lit-element';

import * as url from 'url';
import * as styles from 'styles';
import { context } from 'context';

import { Api } from  'api';
import 'pages/sql-browser';
import 'pages/event-browser';
import 'pages/info';
import 'pages/notfound';

export class Logdk extends LitElement {
	_context = new ContextProvider(this, context);

	static properties = {
		_component: {state: true}
	};

	constructor() {
		super();
		const api = new Api();
		this._title = document.title;
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
		window.removeEventListener('click', this.click.bind(this));
		window.removeEventListener('popstate', this.popstate.bind(this));
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
		this.route(top.location.pathname, false);
	}

	route(path, push) {
		let component = null;
		switch (path) {
		case '': case '/':
			this._title = 'logdk - events';
			component = 'event-browser';
			break;
		case '/sql':
			this._title = 'logdk - sql';
			component = 'sql-browser';
			break;
		case '/info':
			this._title = 'logdk - info';
			component = 'logdk-info';
			break;
		}

		if (component == null) {
			if (push === false) {
				this._title = 'logdk - not found';
				this._component = 'logdk-notfound';
			}
			return false;
		}
		if (push) history.pushState(null, '', path);

		if (this._component === component) {
			const c = this.renderRoot?.querySelector(component);
			if (c.popstate) c.popstate();
		} else {
			this._component = component;
		}
		return true;
	}

	render() {
		const c = this._component
		const tag = literal`${unsafeStatic(c)}`
		document.title = this._title;
		return html`
			<header><nav><ul>
				<li><a class=${c === 'event-browser' ? 'on' : null} href="/" data-wc>home</a>
				<li><a class=${c === 'sql-browser' ? 'on' : null} href="/sql" data-wc>sql</a>
				<li style="margin-left:auto"><a class=${c === 'info' ? 'on' : null} href=/info data-wc>info</a>
			</ul></nav></header>
			<${tag}></${tag}>
		`;
	}

	static styles = [
		styles.reset,
		css`
header {
	background: #fff;
	border-bottom: 1px solid #ff79c6;
}
ul {
	display: flex;
	flex-direction: row;
}
a {
	color: #222;
	line-height: 35px;
	padding: 0 20px;
	display: inline-block;
}
a.on {
	background: #ffdff1;
}
a:hover {
	color: #fff;
	background: #ff79c6;
}
		`
	];
}
customElements.define('logdk-app', Logdk);
