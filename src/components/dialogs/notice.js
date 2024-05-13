import { ContextError } from 'error';
import { Element, html, css } from 'components/base';

class Notice extends Element {
	render() {
		return html`<p><slot></slot></p>`;
	}

	static styles = [
		css`
p {
	background: #ffe;
	width: 100%;
	margin: 0 auto;
	padding: 5px 0;
	border: 1px solid #f0f0f0;
	text-align: center;
}`
	]
}

customElements.define('logdk-notice', Notice);
