import { Element, html, css, unsafeCSS } from 'components/base';
import {map} from 'lit/directives/map.js';
import {range} from 'lit/directives/range.js';

export class Pager extends Element {
	static properties = {
		paging: {type: Object},
	};

	constructor() {
		super();
		this._lastTotal = null;
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
			total = this._lastTotal
		} else {
			this._lastTotal = total;
		}

		if (!total) return;

		const pages = Math.ceil(total / this.paging.limit);
		if (pages == 1) {
			return html``;
		}

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

		let skipToStart = null;
		if (!smallPager) {
			const cutoff = 6;
			if (page == cutoff || first == 2) skipToStart = html`<a data-page=1>1</a>`;
			else if (page > cutoff) skipToStart = html`<a data-page=1>1</a><span>..</span>`;
		}

		let skipToEnd = '';
		if (!smallPager && last < pages) {
			const cutoff = pages - 5;
			if (page == cutoff) skipToEnd = html`<a data-page=${pages}>${pages}</a>`;
			else if (page < cutoff) skipToEnd = html`<span>..</span><a data-page=${pages}>${pages}</a>`;
		}

		return html `<div class=pager @click=${this.click}>
			<a data-page=${page - 1} class=${smallPager || page == 1 ? 'hidden' : ''}>⇦</a>${ skipToStart }${map(range(first, last+1), (i) => {
				return i == page ? html`<a class=active>${i}</a>` : html`<a data-page=${i}>${i}</a>`
			})}${ skipToEnd }<a data-page=${page + 1} class=${smallPager || page == pages ? 'hidden' : ''}>⇨</a>
		</div>`;
	}

	static styles = [
		css`
.pager {
	user-select: none;
	text-align: center;
	margin: 10px 0 50px;
}
.hidden {
	visibility: hidden;
}
a {
	cursor: pointer;
	min-width: 30px;
	text-align: center;
	margin: 0 2px;
	padding: 0 2px;
	display: inline-block;
	border-radius: 4px;
	border: 1px solid #ddd;
}
a:hover {
	text-decoration: none;
	color: ${unsafeCSS(this.css.hov.fg)};
	border-color: ${unsafeCSS(this.css.hov.bd)};
	background: ${unsafeCSS(this.css.hov.bg)};
}
a.active {
	color: ${unsafeCSS(this.css.hi.fg)};
	background: ${unsafeCSS(this.css.hi.bg)};
}
span {
	width: 30px;
	margin: 0 2px;
	display: inline-block;
}
		`];
}

customElements.define('logdk-pager', Pager);
