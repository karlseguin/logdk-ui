import { Element, html, css } from 'components/base';

import './input.js';
import * as url from 'url';
import 'components/pager.js';
import 'components/rowview.js';
import 'components/datatable.js';

export class SQLBrowser extends Element {
	constructor() {
		super();
		this._sql = null;
		this._data = null;
	}

	restoreFromQuery() {
		const qs = top.location.hash;
		const args = url.parseQuery(qs);

		// can't select this until we've loaded the data
		this._selectOnData = args.selected ?? null;

		const page = parseInt(args.page)
		this._page = isNaN(page) ? 1 : page;

		const limit = parseInt(args.limit)
		this._limit = isNaN(limit) ? 100 : limit;

		this._sql = args.sql;
		if (this._sql) {
			this.run(this._sql, true);
		} else {
			this.tableElement.data = null;
		}
	}

	get pagerElement() { return this.selector('logdk-pager'); }
	get inputElement() { return this.selector('sql-input'); }
	get detailElement() { return this.selector('logdk-rowview'); }
	get tableElement() { return this.selector('logdk-datatable'); }

	popstate() {
		this.restoreFromQuery();
		this.inputElement.sql = this._sql;
		this.inputElement.update();
	}

	sqlChange(e) {
		const sql = e.detail;
		this.run(sql, true);
		if (sql !== this._sql) {
			this._sql = sql;
			this.pushURL();
		}
	}

	pageClick(e) {
		this._page = e.detail;
		this.run(this._sql, false);
		this.pushURL();
	}

	rowClick(e) {
		const index = e.detail;
		const data = this._data;

		this._selected = index;
		this.detailElement.row = {
			cols: data.cols,
			types: data.types,
			data: data.rows[index],
		};
		this.pushURL();
	}

	detailClose() {
		this._selected = null;
		this._selectOnData = null;
		if (this.detailElement.row !== null) {
			this.detailElement.row = null;
			this.pushURL();
		}
	}

	pushURL() {
		let opts = {};
		if (this._sql) opts.sql = this._sql;
		if (this._page) opts.page = this._page;
		if (this._selected) opts.selected = this._selected;
		url.pushFragment(url.encodeMap(opts));
	}

	async run(sql, total) {
		this.tableElement.data = 'loading';
		this.pagerElement.paging = null;
		try {
			const page = this._page;
			const limit = this._limit;

			const res = await this.api.exec({sql: sql, total: total, page: page, limit: limit}, {});
			const data = res.body;
			this._data = data;
			this.tableElement.data = {result: data};

			this.pagerElement.paging = {
				page: page,
				limit: limit,
				total: data.total,
			};

			if (this._selectOnData) {
				this.detailElement.row = {
					cols: data.cols,
					types: data.types,
					data: data.rows[this._selectOnData],
				};
				this._selectOnData = null;
			}
		} catch (e) {
			this.detailElement.row = null;
			this.tableElement.data = e;
		}
	}

	render() {
		return html`<div class=browser>
			<sql-input @sql=${this.sqlChange}></sql-input>
			<div class=data>
				<div class=table>
					<logdk-datatable .sortable=${false} .hideableNulls=${false} @rowClick=${this.rowClick}></logdk-datatable>
					<logdk-pager @pageClick=${this.pageClick}></logdk-pager>
				</div>
				<logdk-rowview @close=${this.detailClose} .filterable=${false}></logdk-rowview>
			</div>
		</div>`;
	}

	firstUpdated() {
		this.restoreFromQuery();
		this.inputElement.sql = this._sql;
	}

	static styles = [
		this.css.reset,
		css`
div.browser {
	display: flex;
	padding: 0 10px;
	flex-direction: column;
}
.data {
	gap: 5px;
	display: flex;
}
@media (max-width: 800px) {
	.data {
		flex-direction: column-reverse;
	}
}
		`
	];
}

customElements.define('sql-browser', SQLBrowser);
