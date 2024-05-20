import { Element, html, css, unsafeCSS, unsafeHTML } from 'components/base';
import * as fmt from 'fmt';
import * as filters from 'filters';

export class RowView extends Element {
	static properties = {
		row: {type: Object},
		showNulls: {state: true},
		showFilters: {state: true},
		filterable: {type: Object},
	};

	constructor() {
		super();
		this.showNulls = false;
		this.showFilters = true;
	}

	connectedCallback() {
		super.connectedCallback();
		if (this.filterable) {
			window.addEventListener('keydown', this.keydown.bind(this));
		}
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		if (this.filterable) {
			window.removeEventListener('keydown', this.keydown.bind(this));
		}
	}

	keydown(e) { if (e.key === 'F') if (this.row) this.showFilters = !this.showFilters; }
	toggleFilters() { this.showFilters = !this.showFilters; }
	toggleNulls() { this.showNulls = !this.showNulls; }
	close() { this.dispatchEvent(new CustomEvent('close', null)); }

	filterClick(e) {
		const target = e.target;
		if (target.tagName !== 'LI') return;

		const row = this.row;
		const index = target.closest('label').dataset.index;
		this.dispatchEvent(new CustomEvent('filterClick', {detail: [row.cols[index], target.dataset.op, row.data[index]]}));
	}

	render() {
		const row = this.row;
		if (!row) {
			return html``;
		}

		let nulls = 0;
		const cols = row.cols;
		const types = row.types;
		const showNulls = this.showNulls;
		const showFilters = this.filterable && this.showFilters;

		const fields = row.data.map((value, i) => {
			if (value == null) {
				nulls += 1;
				if (!showNulls) return html``;
			}
			const type = types[i]
			return html`<div class=field>
				<label data-index=${i}>
					${cols[i]}
					${showFilters ? html`<ul class=filters @click=${this.filterClick}>${filters.forValue(type, value)}` : ''}
					<span>${type}</span>
				</label>
				<pre>${this.renderValue(value, type)}</pre>
			</div>`;
		});

		const nullClass = showNulls ? 'on' : 'off';
		const filtersClass = showFilters ? 'on' : 'off'
		return html`<div class=details>
			<ul class=toolbar>
				${ this.filterable ? html`<a class=${filtersClass} @click=${this.toggleFilters}>filters</a>` : ''}
				<a class=${nullClass} @click=${this.toggleNulls}>${nulls} null${ nulls == 1 ? '' : 's'}</a>
				<a class=close @click=${this.close}>✕</a>
			</ul>
			${fields}
		</div>`
	}

	renderValue(value, type) {
		const tv = fmt.typed(value, type)
		if (Array.isArray(tv) === false) {
			return unsafeHTML(fmt.value(tv, true, true));
		}

		return tv.map((v) => html`${fmt.value(v, true, true)}\n`);
	}

	updated() {
		// I don't like this. I don't like that the 800 is hard-coded and has to
		// match our css media query. And I don't even like the scrolling. But
		// on mobile, the details are often out of view from the table, so you
		// can't even tell if clicking did anything. On wider screen, always scrolling
		// causes the screen to needless jump around. So here we are.
		if (document.documentElement.clientWidth > 800) return;
		const toolbar = this.selector('.toolbar');
		if (toolbar) toolbar.scrollIntoView();
	}

	static styles = [
		this.css.reset,
		css`
.details{
	background: #fff;
	border-radius: 4px;
	border: 1px solid #ccc;
	min-width: 400px;
	box-shadow: 0px 0px 4px 1px rgba(0, 0, 0, 0.3);
}

.toolbar {
	display: flex;
	min-width: 350px;
	user-select: none;
	padding: 5px 10px;
	background: #f0f0f0;
	align-items: baseline;
	justify-content: flex-end;
	border-bottom: 1px solid #e0e0e0;
}

.toolbar a {
	font-size: 90%;
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
	margin: 2px 0;
	padding: 10px 10px;
	overflow-wrap: break-word;
	border-bottom: 1px solid #eee;
}
.field:last-of-type {
	border: 0;
}

.field label {
	font-size: 90%;
	display: flex;
	font-weight: bold;
	flex-wrap: wrap;
}
.field pre {
	max-width: 400px;
	white-space: pre-wrap;
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

customElements.define('logdk-rowview', RowView);
