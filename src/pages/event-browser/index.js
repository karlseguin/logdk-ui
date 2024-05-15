import { Task } from '@lit/task';
import { Element, html, css } from 'components/base';
import { ContextError } from 'error';
import * as url from 'url';
import * as fmt from 'fmt';

import './filter.js';
import 'components/pager.js';
import 'components/dialogs';
import 'components/rowview.js';
import 'components/datatable.js';

export class EventBrowser extends Element {
	constructor() {
		super();
		this._data = null;
		this._refreshTimer = null;
		this.restoreFromQuery();
	}

	connectedCallback() {
		super.connectedCallback();
		window.addEventListener('keydown', this.keydown.bind(this));
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		window.removeEventListener('keydown', this.keydown.bind(this));
	}

	restoreFromQuery() {
		const qs = top.location.hash;
		const args = url.parseQuery(qs);
		this._dataset = args.dataset ?? null;
		this._selected = args.selected ?? null;
		if (args.filters) {
			try {
				this._filters = JSON.parse(args.filters);
			} catch {
				this._filters = [];
			}
		} else {
			this._filters = [];
		}

		// can't select this until we've loaded the data
		this._selectOnData = this._selected;

		this._order = args.order ?? '-ldk_id';

		const page = parseInt(args.page)
		this._page = isNaN(page) ? 1 : page;

		const limit = parseInt(args.limit)
		this._limit = isNaN(limit) ? 100 : limit;
	}

	get pagerElement() { return this.selector('logdk-pager'); }
	get filterElement() { return this.selector('event-filter'); }
	get detailElement() { return this.selector('logdk-rowview'); }
	get tableElement() { return this.selector('logdk-datatable'); }

	popstate() {
		this.resetForFirstPage();
		this.restoreFromQuery();
		this.reloadData(true);
		this.filterElement.dataset = this._dataset ?? '';
		this.update();
	}

	keydown(e) {
		if (e.key !== 'Escape') return;
		this.detailClose();
	}

	datasetChange(e) {
		this.resetForFirstPage();
		this._filters = this._filters.filter((f) => f[0] === '$ts');
		this._page = 1;
		this._order = '-ldk_id';
		this._dataset = e.detail;
		this.filterChanged(true);
	}

	dateChange(e) {
		let filters = this._filters.filter((f) => f[0] !== '$ts');
		filters.push(...e.detail);
		this._filters = filters;
		this.filterChanged(true);
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
		this.detailElement.showNulls = this.tableElement.showNulls;
		this.pushURL();
	}

	headerClick(e) {
		const order = e.detail;
		const existing = this._order;
		if (existing && existing.length > 0) {
			if (existing.substr(1) == order) {
				this._order = (existing[0] === '-' ? '+' : '-') + order;
			} else {
				this._order = '+' + order;
			}
		} else {
			this._order = '+' + order;
		}
		this.reloadData(false);
		this.pushURL();
	}

	pageClick(e) {
		this._page = e.detail;
		this.reloadData(false);
		this.pushURL();
	}

	filterClick(e) {
		const filter = e.detail;
		const op = filter[1];

		let handled = false;
		if (op === 'e') {
			// convert multiple equals on the same column into an 'in'
			const col = filter[0];
			const existing = this._filters.find((f) => f[0] == col && (f[1] == 'e' || f[1] == 'in'));
			if (existing) {
				existing[1] = 'in';
				existing.push(filter[2]);
				handled = true;
			}
		}

		if (!handled) {
			this._filters.push(filter);
		}

		this.filterChanged(true);
	}

	filterRemove(e) {
		// e.detail is the index of the filte
		this._filters.splice(e.detail, 1);
		this.filterChanged(true);
	}

	filterChanged(total) {
		this.resetForFirstPage();
		this.filterElement.filters = this._filters;
		this.filterElement.update();
		this.reloadData(total);
		this.pushURL();
	}

	refreshChange(e) {
		clearInterval(this._refreshTimer);
		if (e.detail) {
			this._refreshTimer = setInterval(() => this.reloadData(false, true), 5000)
		}
	}

	detailClose() {
		this._selected = null;
		this._selectOnData = null;
		if (this.detailElement.row !== null) {
			this.detailElement.row = null;
			this.pushURL();
		}
	}

	resetForFirstPage() {
		this._page = 1;
		this._selected = null;
		this._selectOnData = null;
	}

	async reloadData(total, refresh) {
		const dataset = this._dataset;
		if (!dataset) {
			this.tableElement.data = null;
			this.pagerElement.paging = null;
			return;
		}

		if (!refresh) {
			// prevent flashing when we're auto refreshing
			this.pagerElement.paging = null;
			this.tableElement.data = 'loading';
		}
		try {
			const page = this._page;
			const limit = this._limit;
			const order = this._order;

			let args = {total: total, page: page, limit: limit, filters: JSON.stringify(this._filters)};
			if (order) args.order = order;

			const res = await this.api.getEvents(dataset, args, {});
			const data = res.body;
			this._data = data;
			this.tableElement.data = {result: data, order: order};
			this.filterElement.data = {cols: data.cols, types: data.types};

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
			this.pagerElement.paging = null;
			this.tableElement.data = e;
		}
	}

	pushURL() {
		let opts = {};
		if (this._page) opts.page = this._page;
		if (this._order) opts.order = this._order;
		if (this._dataset) opts.dataset = this._dataset;
		if (this._selected) opts.selected = this._selected;

		const filters = JSON.stringify(this._filters);
		if (filters.length > 2) {
			opts.filters = filters;
		}
		url.pushFragment(url.encodeMap(opts));
	}

	_describe = new Task(this, {
		task: async (_, {signal}) => {
			const res = await this.api.describe({signal: signal});
			if (res.status === 200) return res.body;
			throw ContextError.fromRes(res);
		},
		args: () => []
	});

	render() {
		return this._describe.render({
			pending: () => html`<logdk-loading>Loading configuration</logdk-loading>`,
			complete: (data) => {
				if (data.datasets.length == 0) {
					return html`<logdk-notice>There is no data in the system</logdk-notice>`
				}
				return html`
				<div class=browser>
					<event-filter @refreshChange=${this.refreshChange} @dateChange=${this.dateChange} @datasetChange=${this.datasetChange} @filterRemove=${this.filterRemove} .datasets=${data.datasets} .dataset=${this._dataset} .filters=${this._filters}></event-filter>
					<div class=data>
						<div class=table>
							<logdk-datatable .sortable=${true} .hideableNulls=${true} @headerClick=${this.headerClick} @rowClick=${this.rowClick}></logdk-datatable>
							<logdk-pager @pageClick=${this.pageClick}></logdk-pager>
						</div>
						<logdk-rowview @close=${this.detailClose} @filterClick=${this.filterClick} .filterable=${true}></logdk-rowview>
					</div>
				</div>
				`;
			},
			error: (err) => html`<logdk-error message="Failed to fetch information about the system" .err=${err}></logdk-error>`,
		});
	}

	updated() {
		if (this.tableElement && this._dataset) {
			this.reloadData(true);
		}
	}

	static styles = [
		this.css.reset,
		css`
div.browser {
	display: flex;
	padding: 0 10px;
	flex-direction: column;
}
.table {
	display: flex;
	flex: 1 1 auto;
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
		`,
	];
}

customElements.define('event-browser', EventBrowser);
