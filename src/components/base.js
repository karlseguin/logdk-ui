import { LitElement, html, css, unsafeCSS } from 'lit-element';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { ContextConsumer } from '@lit/context';

import * as styles from 'styles';
import { context } from '../context';

class Element extends LitElement {
	static css = {
		form: styles.form,
		reset: styles.reset,
		hdr: {bg: '#ffe6fa', bd: '#ead1e6'},
		sel: {bg: '#c3f9ff', bd: '#99d6dd', fg: '#000'},
		hov: {bg: '#ffc', bd: '#d3d388', fg: '#000'},
		off: {bg: '#eee', bd: '#ddd', fg: '#777'},
		hi: {bg: '#555', bd: '#444', fg: '#fff'},
	};

	_context = new ContextConsumer(this, context);
	get api() { return this._context.value.api; }
	get router() { return this._context.value.router; }
	get settings() { return this._context.value.settings; }
	get datasets() { return this._context.value.datasets; }

	selector(s) { return this.renderRoot.querySelector(s) ?? null; }
};

export { Element, html, css, unsafeCSS, unsafeHTML };
