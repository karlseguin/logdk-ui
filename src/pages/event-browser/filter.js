import { Element, html, css } from 'components/base';
import 'components/select';
import 'components/daterange';
import { nameToOp } from 'filters';
import * as fmt from 'fmt';

export class Filter extends Element {
	static properties = {
		data: {type: Object},
		dataset: {type: String},
		datasets: {type: Array},
		filters: {type: Object},
	};

	constructor() {
		super();
		this._dataset_lookup = null;
	}

	datasetChange(e) {
		this.dispatchEvent(new CustomEvent('datasetChange', {detail: e.detail}));
	}

	dateChange(e) {
		this.dispatchEvent(new CustomEvent('dateChange', {detail: e.detail}));
	}

	filterRemove(e) {
		const index = parseInt(e.target.dataset.op);
		if (isNaN(index)) return; // clicked on the wraping div
		this.dispatchEvent(new CustomEvent('filterRemove', {detail: index}));
	}

	render() {
		if (this._dataset_lookup === null) {
			let lookup = [["choose dataset", ""]];
			for (let i = 0; i < this.datasets.length; i++) {
				const name = this.datasets[i].name;
				lookup.push([name, name]);
			}
			this._dataset_lookup = lookup;
		}

		const filters = this.filters;
		const ts = filters.find((f) => f[0] == '$ts') ?? {};

		return html`
			<div class=dynamic @click=${this.filterRemove}>
				${this.data ? filters.map((f, i) => this.renderFilter(f, i)) : ''}
			</div>
			<div class=static>
				<logdk-select @change=${this.datasetChange} .options=${this._dataset_lookup} .selected=${this.dataset}></logdk-select>
				<logdk-daterange @change=${this.dateChange} .ts=${ts}></logdk-daterange>
			</div>
		`;
	}

	renderFilter(f, i) {
		const col = f[0];
		if (f == '$ts') return '';

		const index = this.data.cols.indexOf(col);
		const type = this.data.types[index];
		return html`<div class=field data-op=${i}>${col} ${nameToOp(f[1])} ${fmt.value(fmt.typed(f[2], type))}</div>`
	}

	static styles = [
		this.css.reset,
		css`
:host {
	display: flex;
}
.dynamic, .static {
	gap: 5px;
	display: flex;
	margin: 5px;
}

.dynamic {
	flex-wrap: wrap;
}

.static {
	margin-left: auto;
}

.field {
	cursor: pointer;
	align-self: center;
	font-family: monospace;
	padding: 2px 5px;
	border-radius: 5px;
	margin-right: 10px;
	white-space: nowrap;
	background: ${this.css.selected.background};
	border: 1px solid ${this.css.selected.border};
}
.field:hover {
	color: ${this.css.control.color};
	border-color: ${this.css.control.border};
	background: ${this.css.control.background};
	text-decoration: line-through;
}
		`
	];
}

customElements.define('event-filter', Filter);
