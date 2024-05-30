import { Task } from '@lit/task';
import { LitElement, css } from 'lit-element';
import { ContextProvider } from '@lit/context';
import { html } from 'lit/static-html.js';

import * as url from 'url';
import * as styles from 'styles';
import { context } from 'context';

import { Api } from 'api';
import { User } from 'user';
import { Router } from 'router';

import 'pages/admin';
import 'pages/sql-browser';
import 'pages/event-browser';
import 'pages/info';
import 'pages/notfound';

export class Logdk extends LitElement {
	_context = new ContextProvider(this, context);

	constructor() {
		super();
		this.api = new Api();
		this._router = new Router(this);
		this._router.route(null, false);
		this.updateDescribe({});
	}

	connectedCallback() {
		super.connectedCallback();
		this._router.connect();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this._router.disconnect();
	}

	route(path) {
		switch (path) {
			case '': case '/': return {title: 'events', component: 'event-browser'};
			case '/sql': return {title: 'sql', component: 'sql-browser'};
			case '/info': return {title: 'info', component: 'logdk-info'};
			case '/admin': return {title: 'settings', component: 'logdk-admin', child: 'logdk-admin-settings'};
			case '/admin/datasets': return {title: 'datasets', component: 'logdk-admin', child: 'logdk-admin-datasets'};
			default: return null;
		}
	}

	_describe = new Task(this, {
		task: async (_, {signal}) => {
			const [descRes, sessRes] = await Promise.all([
				this.api.describe({signal: signal}),
				this.api.sessionInfo({signal: signal}),
			]);
			if (descRes.status !== 200) throw ContextError.fromRes(descRes);
			if (sessRes.status !== 200) throw ContextError.fromRes(sessRes);
			return {describe: descRes.body, user: new User(sessRes.body)};
		},
		args: () => []
	});

	updateDescribe(data) {
		const describe = data.describe || {datasets: [], settings: {}};
		this._context.setValue({
			api: this.api,
			user: data.user,
			router: this._router,
			settings: describe.settings,
			datasets: describe.datasets.sort((a, b) => a.name.localeCompare(b.name)),
		});
	}

	render() {
		return this._describe.render({
			pending: () => html`<logdk-loading>Loading configuration</logdk-loading>`,
			complete: (data) => {
				this.updateDescribe(data);

				const describe = data.describe;
				if (describe.datasets === undefined) {
					return html`<logdk-error message="Failed to fetch information about the system"></logdk-error>`;
				}

				const user = data.user;
				const settings = describe.settings;
				const [c, tag] = this._router.render();

				return html`
					<header><nav><ul>
						<li><a class=${c === 'event-browser' ? 'on' : null} href="/" data-wc>home</a>
						<li><a class=${c === 'sql-browser' ? 'on' : null} href="/sql" data-wc>sql</a>
					</ul>
					<ul>
						<li><a class=${c === 'info' ? 'on' : null} href=/info data-wc>info</a></li>
						${ user.isAdmin() ? html`<li><a class=${c === 'admin' ? 'on' : null} href="/admin" data-wc>admin</a>` : '' }
					</ul></nav></header>
					<${tag}></${tag}>
				`;
			},
			error: (err) => html`<logdk-error message="Failed to fetch information about the system" .err=${err}></logdk-error>`,
		});
	}

	static styles = [
		styles.reset,
		css`
header {
	background: #fff;
	border-bottom: 1px solid #ff79c6;
}
nav {
	display: flex;
}
ul {
	width: 50%;
	display: flex;
	flex-direction: row;
}
ul:last-of-type {
	justify-content: end;
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
