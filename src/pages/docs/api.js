import { Element, html, css } from 'components/base';

export class Api extends Element {
	render() {
		return html`API`;
	}
}

customElements.define('docs-api', Api);
