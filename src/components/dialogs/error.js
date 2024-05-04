import { ContextError } from 'error';
import { styleMap } from 'lit/directives/style-map.js';
import { Element, html, css } from 'components/base';

class Error extends Element {
	static properties = {
		err: {},
		message: {},
		_showDetails: {state: true},
	};

	constructor() {
		super();
		this.absolute = true;
		this._showDetails = true;
	}

	details() {
		const err = this.err;
		const data = err instanceof ContextError ? err.ctx : {name: err.name, message: err.message, type: typeof(err), file: err.fileName, line: err.lineNumber, stack: err.stack};
		const keys = Object.keys(data).sort();
		return html`<table>${keys.map((k) => {
			const value = data[k];
			return html`<tr><td>${k}<td>${typeof value === 'object' ? JSON.stringify(value) : value}`
		})}</table>`;
	}

	toggleDetails(e) {
		this._showDetails = !this._showDetails;
		e.preventDefault();
		e.stopPropagation();
	}

	render() {
		// const styles = this.absolute ? {position: 'absolute', top: '50px'} : {};
		const styles ={};
		return html`
			<div style=${styleMap(styles)}>
				<p>${this.message}. Please try again.</p>
				<p><a href=# @click=${this.toggleDetails}>${this._showDetails ? html`hide details` : html`show details`}</a></p>
				<div ?hidden=${!this._showDetails} class=fields>${this.details()}</div>
			</div>
		`;
	}

	static styles = [
		this.css.reset,
		css`
:host > div {
	background: #fee;
	width: calc(100% - 20px);
	margin: 10px 10px;
	padding: 5px 20px;
	border-radius: 4px;
	border: 1px solid #fcc;
}
a {
	color: #f00;
	text-decoration: underline;
}
p {
	padding: 0 10px;
	text-align: center;
}

table {
	width: 100%;
	margin-top: 10px;
	border-spacing: 0;
	white-space: nowrap;
	border-collapse: collapse;
}
td {
	padding: 4px 10px;
	vertical-align: top;
	border-bottom: 1px solid #fff;
}

tr td:first-of-type {
	font-weight: bold;
}

tr:last-of-type td {
	border: none;
}

td {
	white-space: wrap;
}
`
	];
}

customElements.define('logdk-error', Error);
