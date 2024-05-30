import { ContextError } from 'error';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { Element, html, css } from 'components/base';

class Error extends Element {
	static properties = {
		err: {},
		message: {},
	};

	constructor() {
		super();
		this.absolute = true;
	}

	render() {
		if (this.err === undefined) {
			return html`<h3>${this.message}</h3>`;
		}

		return html`<h3>${this.message}</h3>
		<div>
			<div class=fields>${this.details()}</div>
		</div>`;
	}

	details() {
		const err = this.err;
		const data = err instanceof ContextError ? err.ctx : {name: err.name, message: err.message, type: typeof(err), file: err.fileName, line: err.lineNumber, stack: err.stack};
		const message = data.message;
		delete data.message;

		const keys = Object.keys(data).sort();
		return html`<table>
			<tr><td>message<td><pre>${message}</pre></tr>
			${keys.map((k) => {
				const value = data[k];
				const str = typeof value == 'object' ? JSON.stringify(value, undefined, 2) : value;
				return html`<tr><td>${k}<td><pre>${str}</pre>`;
			})}
			</table>`;
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
h3 {
	margin: 10px 0;
	text-align: center;
}
pre {
	font-size: 16px;
	white-space: pre-wrap
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
