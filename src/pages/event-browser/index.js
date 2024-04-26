import { Task } from '@lit/task';
import { Element, html, css } from 'components/base';
import { ContextError } from 'error';
import * as url from 'url';
import * as fmt from 'fmt';
import { FilterBuilder } from 'sql'

import './table.js';
import './filter.js';
import './detail.js';
import 'components/pager.js';
import 'components/dialogs';

export class EventBrowser extends Element {
	constructor() {
		super();
		this._data = null;
		this.restoreFromQuery();
	}

	restoreFromQuery() {
		const args = url.parseQuery();
		this._filters = args.filters ?? {};
		this._dataset = args.dataset ?? null;
		this._selected = args.selected ?? null;

		const ts = {}
		if (args['ts[rel]']) {
			const rel = args['ts[rel]'];
			ts.rel = rel;
			const [gte, lte] = fmt.relativeTime(rel)
			ts.gte = gte;
			ts.lte = lte;
		} else {
			if (args['ts[gte]']) {
				ts.gte = new Date(parseInt(args['ts[gte]']));
			}
			if (args['ts[lte]']) {
				ts.lte = new Date(parseInt(args['ts[lte]']));
			}
		}
		this._ts = ts;

		// can't select this until we've loaded the data
		this._selectOnData = this._selected;

		this._order = args.order ?? '-$id';

		const page = parseInt(args.page)
		this._page = isNaN(page) ? 1 : page;

		const limit = parseInt(args.limit)
		this._limit = isNaN(limit) ? 100 : limit;
	}

	get tableElement() { return this.selector('event-table'); }
	get pagerElement() { return this.selector('logdk-pager'); }
	get filterElement() { return this.selector('event-filter'); }
	get detailElement() { return this.selector('event-detail'); }

	connectedCallback() {
		super.connectedCallback();
		window.addEventListener('keydown', this.keydown.bind(this));
		window.addEventListener('popstate', this.popstate.bind(this));
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		window.removeEventlistener('keydown', this.keydown.bind(this));
		window.removeEventlistener('popstate', this.popstate.bind(this));
	}

	popstate() {
		this.filterChange();
		this.restoreFromQuery();
		this.reloadData(true);
		this.filterElement.dataset = this._dataset ?? '';
	}

	keydown(e) {
		if (e.key !== 'Escape') return;
		this.detailClose();
	}

	datasetChange(e) {
		this.filterChange();
		this._dataset = e.detail;
		this.reloadData(true);
		this.pushURL();
	}

	dateChange(e) {
		this.filterChange();
		this._ts = e.detail;
		this.reloadData(true);
		this.pushURL();
	}

	filterChange() {
		this._page = 1;
		this._selected = null;
		this._selectOnData = null;
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

	detailClose() {
		this._selected = null;
		this._selectOnData = null;
		if (this.detailElement.row !== null) {
			this.detailElement.row = null;
			this.pushURL();
		}
	}

	async reloadData(total) {
		const dataset = this._dataset;
		if (!dataset) {
			this.tableElement.data = null;
			this.pagerElement.paging = null;
			return;
		}

		this.tableElement.data = 'loading';
		this.pagerElement.paging = null;
		try {
			const ts = this._ts;
			const page = this._page;
			const limit = this._limit;
			const order = this._order;

			let args = {total: total, page: page, limit: limit};
			if (order) args.order = order;

			let filter = new FilterBuilder();
			if (ts) {
				filter.and(() => {
					const gte = ts.gte;
					if (gte) filter.infix('$inserted', '>=', gte)
					const lte = ts.lte;
					if (lte) filter.infix('$inserted', '<=', lte)
				});
			}
			if (filter.str.length > 0) {
				args.filter = filter.str;
			}

			const res = await this.api.getEvents(dataset, args, {});
			const data = res.body;
			this._data = data;
			this.tableElement.data = {result: data, order: order};
			if (data) {
				this.pagerElement.paging = {
					page: page,
					limit: limit,
					total: data.total,
				};
			}

			if (this._selectOnData) {
				this.detailElement.row = {
					cols: data.cols,
					types: data.types,
					data: data.rows[this._selectOnData],
				};
				this._selectOnData = null;
			} else {
				this.detailElement.row = null;
			}
		} catch (e) {
			this.detailElement.row = null;
			this.pagerElement.paging = null;
			this.tableElement.err = e;
		}
	}

	pushURL() {
		let opts = {}
		if (this._page) opts.page = this._page;
		if (this._order) opts.order = this._order;
		if (this._dataset) opts.dataset = this._dataset;
		if (this._selected) opts.selected = this._selected;

		const ts = this._ts;
		if (ts) {
			if (ts.rel) opts['ts[rel]'] = ts.rel
			else {
				if (ts.gte) opts['ts[gte]'] = ts.gte.getTime();
				if (ts.lte) opts['ts[lte]'] = ts.lte.getTime();
			}
		}

		url.pushQuery(opts);
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
					<event-filter @dateChange=${this.dateChange} @datasetChange=${this.datasetChange} .datasets=${data.datasets} .dataset=${this._dataset} .filters=${this._filters} .ts=${this._ts}></event-filter>
					<div class=data>
						<div class=table>
							<event-table @headerClick=${this.headerClick} @rowClick=${this.rowClick}></event-table>
							<logdk-pager @pageClick=${this.pageClick}></logdk-pager>
						</div>
						<event-detail @close=${this.detailClose}></event-detail>
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
event-filter {
	padding: 5px 0;
	margin-left: auto;
}
.table {
	flex: 1;
	display: flex;
	flex-direction: column;
}
.data {
	display: flex;
}
		`
	];
}

customElements.define('event-browser', EventBrowser);
