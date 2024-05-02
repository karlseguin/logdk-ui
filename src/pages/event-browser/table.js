import { Task } from '@lit/task';
import { Element, html, css } from 'components/base';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { ContextError } from 'error';
import * as fmt from 'fmt';

export class Table extends Element {
	static properties = {
		data: {}, // either null, an error, 'loading' or an object with a result and order
	};

	click(e) {
		const target = e.target;
		if (target.tagName === 'TH') {
			this.dispatchEvent(new CustomEvent('headerClick', {detail: target.childNodes[0].textContent}));
		} else {
			const index = target.parentNode.dataset.index;
			this.dispatchEvent(new CustomEvent('rowClick', {detail: index}));
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
			return html`<logdk-error message="Error getting rows" .err=${data} .absolute=${false}></logdk-error>`
		}

		if (this.data === 'loading') {
			return html`<logdk-loading>Loading events</logdk-loading>`;
		}

		return html`<div class=wrap @click=${this.click}>${unsafeHTML(this.renderTable(data))}</div>`;
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
		let str = '<table><thead><tr>';

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
		for (let i = 0; i < cols.length; i += 1) {
			const column = cols[i];
			str += '<th';
			if (column == sortColumn) {
				str += ' class=' + dir;
			}
			str += '>' + cols[i];
		}

		str += '</thead><tbody>';

		if (rows.length === 0) {
			str += `<tr><td style="padding: 20px" colspan=${cols.length}>No results found</tbody></table>`;
			return str;
		}

		for (let i = 0; i < rows.length; i += 1) {
			str += `<tr data-index=${i}>`;
			const row = rows[i];
			for (let j = 0; j < row.length; j += 1) {
				const type = types[j];
				const value = fmt.typed(row[j], type);
				str += '<td>' + (fmt.value(value) ?? '﹘');
			}
		}

		return str + '</tbody></table>';
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

th {
	top: 0px;
	cursor: pointer;
	position: sticky;
	text-align: left;
	font-weight: normal;
	padding-right: 20px;
	background: ${this.css.header.background};
	border: 1px solid ${this.css.header.border};
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
tbody tr:hover td {
	cursor: pointer;
	color: ${this.css.hover.color};
	background: ${this.css.hover.background};
}
		`
	];
}

customElements.define('event-table', Table);
