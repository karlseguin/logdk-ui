import { Task } from '@lit/task';
import { Element, html, css, unsafeCSS } from 'components/base';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { ContextError } from 'error';
import * as fmt from 'fmt';

export class DataTable extends Element {
	static properties = {
		data: {}, // either null, an error, 'loading' or an object with a result and order
		sortable: {type: Boolean},
		fitlerNullCols: {type: Boolean},
	};

	click(e) {
		const target = e.target;
		if (target.tagName === 'TH') {
			this.dispatchEvent(new CustomEvent('headerClick', {detail: target.childNodes[0].textContent}));
		} else {
			const index = target.parentNode.dataset.index;
			// index can be null if we're clicking on the dummy "no results found row"
			if (index) this.dispatchEvent(new CustomEvent('rowClick', {detail: index}));
		}
	}

	willUpdate() {
		const wrap = this.selector('.wrap');
		if (wrap) this._restoreScroll = wrap.scrollLeft;
	}

	render() {
		const data = this.data;
		if (!data) {
			return;
		}

		if (data instanceof Error) {
			return html`<logdk-error message="Error getting rows" .err=${data}></logdk-error>`
		}

		if (this.data === 'loading') {
			return html`<logdk-loading>Loading events</logdk-loading>`;
		}

		return html`<div @click=${this.click}>${unsafeHTML(this.renderTable(data))}</div>`;
	}

	updated() {
		if (this._restoreScroll) {
			const wrap = this.selector('.wrap');
			if (wrap) {
				wrap.scrollLeft = this._restoreScroll;
				this._restoreScroll = 0;
			}
		}
	}

	renderTable(data) {
		const result = data.result;
		const cols = result.cols;
		const rows = result.rows;
		const types = result.types;

		// By default, we hide columns that have all null values (in the given page)
		// This _might_ hide some data, but given that we're generally expecting
		// wide table, I think it makes sense.
		const displayIndex = this.displayable(cols.length, rows);
		const allNullCount = cols.length - displayIndex.length;

		let str = '<div class=wrap><table><thead><tr>';

		let dir = 'asc';
		let sortColumn = data.order;
		if (sortColumn && sortColumn.length > 1) {
			if (sortColumn[0] === '-') {
				sortColumn = sortColumn.substr(1);
				dir = 'desc';
			} else if (sortColumn[0] == '+') {
				sortColumn = sortColumn.substr(1);
			}
		}

		const sortable = this.sortable;
		for (let i = 0; i < displayIndex.length; i += 1) {
			const idx = displayIndex[i];
			const column = cols[idx];
			if (column == sortColumn) {
				str += `<th class="sortable ${dir}">${cols[idx]}`;
			} else if (sortable) {
				str += `<th class=sortable>${cols[idx]}`;
			} else {
				str += `<th>${cols[idx]}`;
			}
		}

		str += '</thead><tbody>';

		if (rows.length === 0) {
			str += `<tr class=empty><td style="padding: 20px" colspan=${cols.length}>No results found</tbody></table>`;
			return str;
		}

		for (let i = 0; i < rows.length; i += 1) {
			str += `<tr data-index=${i}>`;
			const row = rows[i];
			for (let j = 0; j < displayIndex.length; j += 1) {
				const idx = displayIndex[j];
				const type = types[idx];
				const value = fmt.typed(row[idx], type);
				str += '<td>' + (fmt.value(value, true) ?? '﹘');
			}
		}

			str += '</tbody></table></div>';
			return str;
	}

	displayable(colsCount, rows) {
		const all = Array.from({length: colsCount}, (_, i) => i);
		if (this.fitlerNullCols === false) return all;

		let nulls = [...all];
		for (let i = 0; i < rows.length; ++i) {
			const row = rows[i];
			for (let j = 0; j < nulls.length;) {
				if (row[nulls[j]] === null) {
					++j;
					continue;
				}

				if (nulls.length === 1) {
					// This was our last column with a non-null value, therefor all columns
					// have at least 1 non-null value and we should show them all.
					return all;
				}
				if (j === nulls.length - 1)  nulls.pop();
				else nulls[j] = nulls.pop();
			}
		}
		return all.filter((i) => !nulls.includes(i));
	}

	formaTimestamp(dt) {
		const date = dt.toLocaleDateString(undefined, dateFormat);
		// the first split gives us the time (with millisecond)
		// the secod split strips out the millisecond (and UTC timezone indicator)
		const time = dt.toISOString().split('T')[1].split('.')[0];
		return date + ' ' + time;
	}

	static styles = [
		this.css.reset,
		css`
:host {
	width: 100%;
}
.wrap {
	display: grid;
	max-height: calc(100vh - 200px);
	grid-template-columns: repeat(1, minmax(0, 1fr));
	overflow: auto;
	min-width: 100%;
	white-space: nowrap;
}

table {
	border-spacing: 0;
	white-space: nowrap;
	table-layout: fixed;
	border-collapse: collapse;
}

td, th {
	padding: 4px 4px 2px;
	border: 1px solid #e0e0e0;
	max-width: 500px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

th.sortable {
	cursor: pointer;
}

th {
	top: 0px;
	position: sticky;
	text-align: left;
	font-weight: normal;
	padding-right: 20px;
	background: ${unsafeCSS(this.css.hdr.bg)};
	border: 1px solid ${unsafeCSS(this.css.hdr.bd)};
	border-top: 0;
}

th:after{
	margin-left: 4px;
	font-size: 60%;
}

th.asc, th.desc {
	padding-right: 4px;
}

th.asc:after {
	content: '▲';
}

th.desc:after {
	content: '▼'
}

// table > tfoot th { background: aquamarine;position: sticky;bottom: 0px;}
tbody tr:nth-child(odd) {
	background: #f6f6f6;
}
tbody tr:not(.empty):hover td {
	cursor: pointer;
	color: ${unsafeCSS(this.css.hov.fg)};
	background: ${unsafeCSS(this.css.hov.bg)};
}
		`
	];
}

customElements.define('logdk-datatable', DataTable);
