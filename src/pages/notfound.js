import { Element, html, css } from 'components/base';

export class NotFound extends Element {
	render() {
		return html`<h3>404</h3><p>Page Not Found</p>`;
	}

	static styles = [
		this.css.reset,
		css`
:host {
	font-size: 120%;
	background: #ffe;
	width: 100%;
	margin: 0 auto;
	text-align: center;
}`
	]
}

customElements.define('logdk-notfound', NotFound);
