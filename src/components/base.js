import { LitElement, html, css, unsafeCSS } from 'lit-element';
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

	context = new ContextConsumer(this, context);

	get api() { return this.context.value.api; }

	selector(s) { return this.renderRoot?.querySelector(s) ?? null; }
};

export { Element, html, css, unsafeCSS };
