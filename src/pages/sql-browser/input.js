import { Element, html, css } from 'components/base';

export class Input extends Element {
	static properties = {
		sql: {type: String},
	};

	keydown(e) {
		if (e.key !== 'Enter' || e.shiftKey !== true) return;
		this.run();
		e.preventDefault();
		e.stopPropagation();
	}

	run() {
		const sql = this.selector('.sql').textContent;
		if (sql) {
			this.dispatchEvent(new CustomEvent('sql', {detail: sql}));
		}
	}

	render() {
		return html`<div class=sql @keydown=${this.keydown} contenteditable=true>
			${this.sql}
			<input @click=${this.run} type=button value=run>
		</div>`;
	}

	static styles = [
		this.css.reset,
		this.css.form,
		css`
.sql {
	font-family: monospace;
	padding: 10px;
	font-size: 16px;
	border: 1px solid #ccc;
	border-radius: 4px;
	margin: 10px 0;
	position: relative;
}
input{
	position: absolute;
	bottom: 4px;
	right: 4px;
}
		`
	];
}

customElements.define('sql-input', Input);
