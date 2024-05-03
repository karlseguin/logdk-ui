import { Element, html, css, unsafeCSS } from 'components/base';
import * as fmt from 'fmt';
import * as filters from 'filters';

export class Detail extends Element {
	static properties = {
		row: {type: Object},
		showNull: {state: true},
		showFilters: {state: true},
	};

	constructor() {
		super();
		this.showNull = false;
		this.showFilters = true;
	}

	connectedCallback() {
		super.connectedCallback();
		window.addEventListener('keydown', this.keydown.bind(this));
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		window.removeEventlistener('keydown', this.keydown.bind(this));
	}

	keydown(e) { if (e.key === 'F') if (this.row) this.showFilters = !this.showFilters; }
	toggleFilters() { this.showFilters = !this.showFilters; }
	toggleNull() { this.showNull = !this.showNull; }
	close() { this.dispatchEvent(new CustomEvent('close', null)); }

	filterClick(e) {
		const target = e.target;
		if (target.tagName !== 'LI') return;

		const row = this.row;
		const index = target.closest('label').dataset.index;
		this.dispatchEvent(new CustomEvent('filterClick', {detail: [row.cols[index], target.dataset.op, row.data[index]]}));
	}

	render() {
		if (this.row == null) {
			return html``;
		}
		const row = this.row;

		let nulls = 0;
		const cols = row.cols;
		const types = row.types;
		const showNull = this.showNull;
		const showFilters = this.showFilters;

		const fields = row.data.map((value, i) => {
			if (value == null) {
				nulls += 1;
				if (!showNull) return html``;
			}
			const type = types[i]
			return html`<div class=field>
				<label data-index=${i}>
					${cols[i]}
					${showFilters ? html`<ul class=filters @click=${this.filterClick}>${filters.forValue(type, value)}` : ''}
					<span>${type}</span>
				</label>
				${fmt.value(fmt.typed(value, type)) ?? 'null'}
			</div>`;
		});

		const nullClass = showNull ? 'on' : 'off';
		const filtersClass = showFilters ? 'on' : 'off'
		return html`<div class=details>
			<ul class=toolbar>
				<a class=${filtersClass} @click=${this.toggleFilters}>filters</a>
				<a class=${nullClass} @click=${this.toggleNull}>${nulls} null${ nulls == 1 ? '' : 's'}</a>
				<a class=close @click=${this.close}>x</a>
			</ul>
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
	display: flex;
	user-select: none;
	padding: 2px 10px;
	background: #f0f0f0;
	align-items: baseline;
	justify-content: flex-end;
	border-bottom: 1px solid #e0e0e0;
}

.toolbar a {
	font-size: 80%;
	padding: 0 8px;
	cursor: pointer;
	margin-left: 10px;
	border-radius: 4px;
}
.toolbar .close {
	font-size: 100%;
}
.toolbar a:hover {
	color: ${unsafeCSS(this.css.hi.fg)};
	border-color: ${unsafeCSS(this.css.hi.bd)};
	background: ${unsafeCSS(this.css.hi.bg)};
}

.toolbar .off {
	text-decoration: line-through;
	border: 1px solid transparent;
	color: ${unsafeCSS(this.css.off.fg)};
	background: ${unsafeCSS(this.css.off.bg)};
}

.toolbar .on {
	color: ${unsafeCSS(this.css.sel.fg)};
	background: ${unsafeCSS(this.css.sel.bg)};
	border: 1px solid ${unsafeCSS(this.css.sel.bd)};
}

.field {
	margin: 1px 0;
	padding: 2px 10px;
	border-bottom: 1px solid #eee;
}
.field:last-of-type {
	border: 0;
}

label {
	display: flex;
	font-weight: bold;
	flex-wrap: wrap;
}
.filters {
	gap: 5px;
	font-size: 80%;
	user-select: none;
	margin-left: 5px;
	display: inline-flex;
}
.filters li {
	cursor: pointer;
	white-space: nowrap;
	font-family: monospace;
	border: 1px solid ${unsafeCSS(this.css.hi.bg)};
	border-radius: 4px;
	padding: 0px 4px;
	align-self: center;
}
.filters li:hover {
	color: ${unsafeCSS(this.css.hi.fg)};
	background: ${unsafeCSS(this.css.hi.bg)};
}
span {
	font-weight: normal;
	font-size: 80%;
	color: #999;
	margin-left: auto;
}
		`
	];
}

customElements.define('event-detail', Detail);
