import { Element, html, css } from 'components/base';
import * as fmt from 'fmt';

export class Detail extends Element {
	static properties = {
		row: {type: Object},
	};

	close() {
		this.dispatchEvent(new CustomEvent('close', null));
	}

	render() {
		if (this.row == null) {
			return html``;
		}
		const row = this.row;

		const cols = row.cols;
		const types = row.types;
		const fields =  row.data.map((value, i) => {
			if (value == null) return html``;
			const type = types[i]
			return html`<div class=field>
				<label>${cols[i]} <span>${type}</span></label>
				${fmt.value(fmt.typed(value, type))}
			</div>`;
		});

		return html`<div class=details>
			<div class=toolbar><a class=close @click=${this.close}>x</a></div>
			${fields}
		</div>`
	}

	static styles = [
		this.css.reset,
		css`
.details{
	background: #fff;
	width: 400px;
	border-radius: 4px;
	border: 1px solid #ccc;
	position: relative;
	box-shadow: 0px 0px 4px 1px rgba(0, 0, 0, 0.3);
}

.toolbar {
	width: 100%;
	padding: 2px 10px;
	display: inline-block;
	background: #f0f0f0;
	border-bottom: 1px solid #e0e0e0;
	cursor: pointer;
	display: flex;
}

.toolbar a {
	padding: 0 10px;
	margin-left: auto;
	border-radius: 100px;
}
.toolbar a:hover {
	color: #fff;
	background: #999;
}

.field {
	padding: 2px 10px;
	margin: 1px 0;
	border-bottom: 1px solid #eee;
}
.field:last-of-type {
	border: 0;
}

label {
	display: block;
	font-weight: bold;
}
span {
	font-weight: normal;
	font-size: 80%;
	color: #999;
	float: right;
}
		`
	];
}

customElements.define('event-detail', Detail);
