import { Element, html, css, unsafeCSS } from 'components/base';
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
		autoRefresh: {type: Boolean},
		reloading: {type: Boolean}
	};

	constructor() {
		super();
		this.reloading = false;
		this._dataset_lookup = null;
	}

	datasetChange(e) {
		this.dispatchEvent(new CustomEvent('datasetChange', {detail: e.detail}));
	}

	dateChange(e) {
		const ts = e.detail;
		let filters = [];
		const rel = ts.rel;
		if (rel) {
			const mins = parseInt(rel)
			filters.push(['$ts', 'rel', isNaN(mins) ? ts.rel : mins])
		} else {
			if (ts.ge) filters.push(['$ts', 'ge', ts.ge.getTime()]);
			if (ts.le) filters.push(['$ts', 'le',ts.le.getTime()]);
		}
		this.dispatchEvent(new CustomEvent('dateChange', {detail: filters}));
	}

	filterRemove(e) {
		const index = parseInt(e.target.dataset.op);
		if (isNaN(index)) return; // clicked on the wraping div
		this.dispatchEvent(new CustomEvent('filterRemove', {detail: index}));
	}

	refreshClick() {
		this.autoRefresh = !this.autoRefresh;
		this.dispatchEvent(new CustomEvent('refreshChange', {detail: this.autoRefresh}));
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
		const ts = filters.reduce((acc, f) => {
			if (f[0] == '$ts') acc[f[1]] = f[1] == 'rel' ? f[2] : new Date(f[2]);
			return acc;
		}, {});

		const refreshClass = this.reloading ? 'active': this.autoRefresh ? 'on' : 'off';

		return html`<div>
			<div class=dynamic @click=${this.filterRemove}>
				${this.data ? filters.map((f, i) => this.renderFilter(f, i)) : ''}
			</div>
			<div class=static>
				<logdk-select @change=${this.datasetChange} .options=${this._dataset_lookup} .selected=${this.dataset}></logdk-select>
				<logdk-daterange @change=${this.dateChange} .ts=${ts}></logdk-daterange>
				<a class="refresh ${refreshClass}" @click=${this.refreshClick}>⟳</a>
			</div>
		</div>`;
	}

	renderFilter(f, i) {
		const col = f[0];
		if (col == '$ts') return '';

		const op = f[1];
		const index = this.data.cols.indexOf(col);
		const type = this.data.types[index];
		return html`<div class=field data-op=${i}>${col} ${nameToOp(op)} ${this.renderValue(op, f, type) ?? 'null'}</div>`;
	}

	renderValue(op, f, type) {
		switch (op) {
			case 'in': return fmt.value(f.slice(2));
			default: return fmt.value(fmt.typed(f[2], type), false, true);
		}
	}

	static styles = [
		this.css.reset,
		css`
:host > div {
	display: flex;
	align-items: flex-start;
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
	color: ${unsafeCSS(this.css.sel.fg)};
	background: ${unsafeCSS(this.css.sel.bg)};
	border: 1px solid ${unsafeCSS(this.css.sel.bd)};
	max-width: 500px;
	text-overflow: ellipsis;
	overflow: hidden;
}
.field:hover {
	color: ${unsafeCSS(this.css.hi.fg)};
	border-color: ${unsafeCSS(this.css.hi.bd)};
	background: ${unsafeCSS(this.css.hi.bg)};
	text-decoration: line-through;
}
.refresh {
	cursor: pointer;
	border-radius: 4px;
	padding: 2px 8px;
}
.refresh.off {
	border: 1px solid transparent;
	color: ${unsafeCSS(this.css.off.fg)};
	background: ${unsafeCSS(this.css.off.bg)};
}
.refresh.on {
	color: ${unsafeCSS(this.css.sel.fg)};
	background: ${unsafeCSS(this.css.sel.bg)};
	border: 1px solid ${unsafeCSS(this.css.sel.bd)};
}
.refresh.active {
	background: transparent;
	animation: rotate 1s infinite linear;
}

.refresh:hover {
	color: ${unsafeCSS(this.css.hi.fg)};
	border-color: ${unsafeCSS(this.css.hi.bd)};
	background: ${unsafeCSS(this.css.hi.bg)};
}
@keyframes rotate{
	0%{transform: rotate(0deg);}
	50%{transform: rotate(180deg);}
	100%{transform: rotate(360deg);}
}

@media (max-width: 800px) {
	:host > div {
		flex-direction: column-reverse;
	}
	.static {margin: 5px 5px 0;}
}
		`
	];
}

customElements.define('event-filter', Filter);
