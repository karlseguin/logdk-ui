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
		const sql = this.selector('textarea').value;
		if (sql) {
			this.dispatchEvent(new CustomEvent('sql', {detail: sql}));
		}
	}

	render() {
		return html`<div>
			<textarea @keydown=${this.keydown}>${this.sql}</textarea>
			<input @click=${this.run} type=button value=run>
		</div>
		`;
	}

	static styles = [
		this.css.reset,
		this.css.form,
		css`
div {
	width: 100%;
	margin: 10px 0;
	display: flex;
	flex-direction: column;
}
textarea {
	width: 100%;
	height: 200px;
	padding: 5px;
	font-size: 16px;
}
input{
	margin-top: 5px;
	margin-left: auto;
}
		`
	];
}

customElements.define('sql-input', Input);
