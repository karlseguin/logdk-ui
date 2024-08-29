import { Element, css } from 'components/base';
import { html } from 'lit/static-html.js';

import './tokens';
import './settings';
import './datasets';

export class Admin extends Element {
	popstate() {
		this.update()
	}

	render() {
		const [c, tag] = this.router.renderChild();

		return html`<nav><ul>
			<li><a href=/admin data-wc>general settings</a></li>
			<li><a href=/admin/tokens data-wc>tokens</a></li>
		</ul></nav>
		<div><${tag}></${tag}></div>`;
	}

	static styles = [
		this.css.reset,
		this.css.form,
		css `
:host {
	display: flex;
}

nav {
	width: 200px;
	padding-top: 20px;
	border-right: 1px solid #f0f0f0;

}
nav a {
	color: #000;
	padding: 5px;
	display: block;
	cursor: pointer;
	border-bottom: 1px solid #f0f0f0;
}
nav a:hover {
	color: #fff;
	background: #ff79c6;
}
div {
	padding: 20px;
	width: 100%;
}
		`
	]
}

customElements.define('logdk-admin', Admin);
