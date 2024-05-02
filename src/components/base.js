import { LitElement, html, css, unsafeCSS } from 'lit-element';
import { ContextConsumer } from '@lit/context';

import * as styles from 'styles';
import { context } from '../context';

class Element extends LitElement {
	static css = {
		form: styles.form,
		reset: styles.reset,
		hover: {background: unsafeCSS`#ffc`, border: unsafeCSS`#d3d388`, color: unsafeCSS`#000`},
		header: {background: unsafeCSS`#ffe6fa`, border: unsafeCSS`#ead1e6`},
		selected: {background: unsafeCSS`#c3f9ff`, border: unsafeCSS`#99d6dd`, color: unsafeCSS`#000`},
		disabled: {background: unsafeCSS`#eee`, color: unsafeCSS`#777`, border: unsafeCSS`#ddd`},
		control: {background: unsafeCSS`#555`, color: unsafeCSS`#fff`, border: unsafeCSS`#444`},
	};

	context = new ContextConsumer(this, context);

	get api() { return this.context.value.api; }

	selector(s) { return this.renderRoot?.querySelector(s) ?? null; }
};

export { Element, html, css };
