import { ContextError } from 'error';
import { styleMap } from 'lit/directives/style-map.js';
import { Element, html, css } from 'components/base';

class Error extends Element {
	static properties = {
		err: {},
		message: {},
		absolute: {type: Boolean},
		_showDetails: {state: true},
	};

	constructor() {
		super();
		this.absolute = true;
		this._showDetails = false;
	}

	details() {
		const err = this.err;
		const data = err instanceof ContextError ? err.ctx : {name: err.name, message: err.message, type: typeof(err), file: err.fileName, line: err.lineNumber, stack: err.stack};
		const keys = Object.keys(data).sort();
		return html`${keys.map((k) => {
			const value = data[k];
			return html`<div><label>${k}</label><span>${typeof value === 'object' ? JSON.stringify(value) : value}</span></div>\n`
		})}`;
	}

	toggleDetails() {
		this._showDetails = !this._showDetails;
	}

	render() {
		const styles = this.absolute ? {position: 'absolute', top: '50px'} : {};
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
	width: 600px;
	margin: 0 auto;
	padding: 5px 20px;
	border-radius: 4px;
	border: 1px solid #fcc;
	left: calc(50% - 300px);
}
a {
	color: #f00;
	text-decoration: underline;
}
p {
	padding:  0 10px;
	text-align: center;
}
.fields > div {
	gap: 10px;
	padding: 5px 0;
	display: flex;
	font-family: monospace;
}
label {
	font-weight: bold;
	width: 75px;
}
span {
	width: 100%;
	word-break: break-all;
}
`
	];
}

customElements.define('logdk-error', Error);
