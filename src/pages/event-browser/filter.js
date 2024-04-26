import { Element, html, css } from 'components/base';
import 'components/select.js';
import 'components/daterange';

export class Filter extends Element {
	static properties = {
		dataset: {type: String},
		datasets: {type: Array},
		ts: {type: Object}
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

	render() {
		if (this._dataset_lookup === null) {
			let lookup = [["choose dataset", ""]];
			for (let i = 0; i < this.datasets.length; i++) {
				const name = this.datasets[i].name;
				lookup.push([name, name]);
			}
			this._dataset_lookup = lookup;
		}
		return html`
			<div class=field>
				<logdk-select @change=${this.datasetChange} .options=${this._dataset_lookup} .selected=${this.dataset}></logdk-select>
			</div>
			<div class=field>
				<logdk-daterange @change=${this.dateChange} .ts=${this.ts ?? {}}></logdk-daterange>
			</div>
		`;
	}

	static styles = [
		this.css.reset,
		css`
:host {
	display: flex;
	gap: 5px;
}

.field {
}
		`
	];
}

customElements.define('event-filter', Filter);
