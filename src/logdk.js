import { LitElement, html, css } from 'lit-element';
import { ContextProvider } from '@lit/context';

import * as styles from 'styles';
import { context } from 'context.js';

import { Api } from  'api';
import 'pages/event-browser';

export class Logdk extends LitElement {
	_context = new ContextProvider(this, context);

	constructor() {
		super();
		const api = new Api();
		this._context.setValue({api: api});
	}

	render() {
		return html`
			<header><nav><ul>
				<li><a href=/>home</a>
				<!--<li><a href=/docs/api>api</a>-->
			</ul></nav></header>
			<slot><event-browser></event-browser></slot>
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
