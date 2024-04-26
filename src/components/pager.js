import { Element, html, css } from 'components/base';
import {map} from 'lit/directives/map.js';
import {range} from 'lit/directives/range.js';
import {styleMap} from 'lit/directives/style-map.js';

export class Pager extends Element {
	static properties = {
		paging: {type: Object},
	};

	constructor() {
		super();
		this._last_total = null;
	}

	click(e) {
		const page = parseInt(e.target.dataset.page);
		if (page) {
			this.dispatchEvent(new CustomEvent('pageClick', { detail: page }));
		}
	}

	render() {
		if (!this.paging) return;

		let total = this.paging.total;
		if (total == undefined || total == null) {
			total = this._last_total
		} else {
			this._last_total = total;
		}

		if (!total) return;

		const pages = Math.ceil(total / this.paging.limit);
		if (pages == 1) return;

		const page = this.paging.page;
		let first = page - 4;
		let last = page + 4;

		if (first < 2) {
			first = 1;
			last = 10;
		}
		if (last > pages) {
			last = pages;
			first = Math.max(1, last - 8);
		}

		const smallPager = pages <= 8;

		let skipToStart = '';
		if (!smallPager) {
			const cutoff = 6;
			if (page == cutoff) skipToStart = html`<a data-page=1>1</a>`;
			if (page > cutoff) skipToStart = html`<a data-page=1>1</a><span>..</span>`;
		}

		let skipToEnd = '';
		if (!smallPager) {
			const cutoff = pages - 5;
			if (page == cutoff) skipToEnd = html`<a data-page=${pages}>${pages}</a>`;
			else if (page < cutoff) skipToEnd = html`<span>..</span><a data-page=${pages}>${pages}</a>`;
		}

		return html `<div class=pager @click=${this.click}>
			<a data-page=${page - 1} class=${smallPager || page == 1 ? 'hidden' : ''}>&lt;</a>
			${ skipToStart }
			${map(range(first, last+1), (i) => {
				return i == page ? html`<a class=active>${i}</a>` : html`<a data-page=${i}>${i}</a>`
			})}
			${ skipToEnd }
			<a data-page=${page + 1} class=${smallPager || page == pages ? 'hidden' : ''}>&gt;</a>
		</div>`
	}

	static styles = [
		css`
.pager {
	user-select: none;
	margin-top: 20px;
	text-align: center;
}
.hidden {
	visibility: hidden;
}
a {
	cursor: pointer;
	width: 40px;
	text-align: center;
	padding: 5px 0;
	margin: 0 2px 10px;
	display: inline-block;
	border-radius: 4px;
	border: 1px solid #ddd;
}
a:hover {
	text-decoration: none;
	border-color: ${this.css.hover.border};
	background: ${this.css.hover.background};
}
a.active {
	color: ${this.css.control.color};
	background: ${this.css.control.background};
	border-color: transparent;
}
span {
	width: 30px;
	margin: 0 2px;
	display: inline-block;
}
		`];
}

customElements.define('logdk-pager', Pager);
