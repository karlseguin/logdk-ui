import { Element, html, css } from 'components/base';
import {styleMap} from 'lit/directives/style-map.js';

export class Select extends Element {
	static properties = {
		width: {type: String},
		selected: {type: String},
		options: {},
	};

	constructor() {
		super();
		this.width = 'inherit';
	}

	get selectElement() {
		return this.selector('select');
	}

	change() {
		this.selected = this.selectElement.value;
		this.dispatchEvent(new CustomEvent('change', { detail: this.selected }));
	}

	render() {
		const selected = this.selected ?? '';

		// WHAT? There's something about select and reactive properties that doesn't
		// play nice. The select has its own internal state that isn't reflected?
		// There are a few github issues opened about this or something similar, but
		// using this settimeout was the only reliable (and easy) way I found to
		// make this work
		setTimeout(() => {this.selectElement.value = selected}, 0);

		const styles = {width: this.width};
		return html`
			<select @change=${this.change} style=${styleMap(styles)}>
				${this.options.map(([k, v]) => html`<option ?selected=${selected == v} value="${v}">${k}</option>`)}
			</select>
		`;
	}

	static styles = [this.css.form];
}

customElements.define('logdk-select', Select);
