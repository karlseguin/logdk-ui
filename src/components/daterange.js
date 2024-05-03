import { Element, html, css, unsafeCSS } from 'components/base';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { relativeTime } from 'fmt';

const MONTHS = Array.from({length: 12}, (_, i) => new Date(2000, i, 1).toLocaleDateString(undefined, {'month': 'long'}));
const DISPLAY_FORMAT = {month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC'};
const SHORTCUTS = {
	5: 'last 5 minutes',
	15: 'last 15 minutes',
	60: 'last hour',
	240: 'last 4 hours',
	720: 'last 12 hours',
	1440: 'last 24 hours',
	10080: 'last 7 days',
	't': 'today',
	'y': 'yesterday',
	'cm': 'current month',
	'lm': 'last month',
	'ytd': 'year to date',
};

const MODE_DATE_PICKER = 1;
const MODE_MONTH_PICKER = 2;

export class DateRange extends Element {
	static properties = {
		ts: {type: Object},
		showPicker: {type: Boolean},
	};

	constructor() {
		super();
		this._first = true;
		this._current = null;
		this._mode = MODE_DATE_PICKER;
	}

	connectedCallback() {
		super.connectedCallback();
		window.addEventListener('click', this.click.bind(this));
		window.addEventListener('keydown', this.keydown.bind(this));
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		window.removeEventlistener('click', this.click.bind(this));
		window.removeEventlistener('keydown', this.keydown.bind(this));
	}

	keydown(e) {
		if (e.key === 'Escape') {
			return this.close(false);
		}
		if (e.key === 'Enter') {
			return this.close(true);
		}
	}

	close(event) {
		this.showPicker = false;
		this._mode = MODE_DATE_PICKER;
		this.applyTime();
		if (!event) return;
		this.dispatchEvent(new CustomEvent('change', {detail: this.ts}));
	}

	click(e) {
		const path = e.composedPath();
		if (path.includes(this.selector('.wrap')) == false) {
			if (this.showPicker) this.close(true);
			return
		}

		if (!this.showPicker) {
			this._first = true;
			this.showPicker = true;
			return;
		}

		if (path[0] == this.selector('input[name="display"]')) {
			this.showPicker = false;
			return;
		}

		const op = e.target.dataset.op;
		if (!op) return;

		e.stopPropagation();

		if (this._mode === MODE_MONTH_PICKER) {
			if (op === 'ok') {
				const year = parseInt(this.selector('input[name="year"]').value) || this._current.getUTCFullYear();
				this._current.setUTCYear(year);
				this._mode = MODE_DATE_PICKER;
			} else {
				this._current.setUTCMonth(parseInt(op));
			}
			this.update();
			return;
		}

		switch (op) {
		case 'prev':
			this._current.setUTCMonth(this._current.getUTCMonth() - 1);
			break;
		case 'next':
			this._current.setUTCMonth(this._current.getUTCMonth() + 1);
			break;
		case 'm1':
			this._mode = MODE_DATE_PICKER;
			break;
		case 'm2':
			this._mode = MODE_MONTH_PICKER;
			break;
		case 'clear':
			this._first = false;
			this.ts = {};
			this.close(true);
			break;
		case 'apply': {
			this.close(true);
			break;
		}
		default:
			if (this._first) {
				this._first = false;
				this.ts.le = null;
				this.ts.rel = null;
				this.ts.ge = new Date(parseInt(op));
				this.applyTime();
			} else {
				this.ts.le = new Date(parseInt(op));
				this.applyTime();
				if (this.ts.le < this.ts.ge) {
					const x = this.ts.le;
					this.ts.le = this.get;
					this.setGE(x);
				}
				this._first = true;
			}
			break;
		}
		this.update();
	}

	shortcut(e) {
		e.stopPropagation();
		const target = e.target;
		const op = e.target.dataset.op ?? '';
		const result = relativeTime(op);
		if (!result) return;

		const [ge, le] = result;
		this.ts.le = le;
		this.setGE(ge);

		this.ts.rel = op;
		this.close(true);
	}

	setGE(date) {
		this.ts.ge = date;
		this._current = new Date(date.getTime()); // don't set to this.ge as we mutate _current
	}

	render() {
		this._current = this._current ?? this.ts?.ge;
		if (!this._current) {
			if (!this.ts) this.ts = {};
			this._current = new Date();
			this._current.setUTCHours(0);
			this._current.setUTCMinutes(0);
		}

		return html`<div class=wrap>
			<input name=display value="${this.formatted()}" readonly>
			${this.showPicker ? this.renderPicker() : ''}
		</div>`;
	}

	formatted() {
		const ts = this.ts;

		if (ts.rel) {
			return SHORTCUTS[ts.rel];
		}

		let str = '';
		if (ts.ge) {
			str += ts.ge.toLocaleString(undefined, DISPLAY_FORMAT);
		}
		if (ts.le) {
			if (!ts.ge) str += '∞'
			str += ' - ' + ts.le.toLocaleString(undefined, DISPLAY_FORMAT);
		} else if (ts.ge) {
			str += ' - ∞'
		}

		return str;
	}

	renderPicker() {
		switch (this._mode) {
		case MODE_DATE_PICKER:
			return this.renderDatePicker();
		case MODE_MONTH_PICKER:
			return this.renderMonthPicker();
		}
	}

	renderDatePicker() {
		const current = this._current;
		const next = new Date(current.getUTCFullYear(), current.getUTCMonth() + 1, 1, 23, 59);

		return html`<div class=picker @click=${this.click}>
			<div class=datePicker>
				<div class=header>
					<span data-op=prev>«</span>
					<div><span data-op=m2>${MONTHS[current.getUTCMonth()]} ${current.getUTCFullYear()}</span></div>
				</div>
				${unsafeHTML(this.buildMonth(current))}
				<div class=time><label>Start time</label> <input type=time name=start_time value="${this.formatTime(this.ts.ge, '00:00')}"></div>
			</div>
			<div class=datePicker>
				<div class=header>
					<div><span data-op=m2>${MONTHS[next.getUTCMonth()]} ${next.getUTCFullYear()}</span></div>
					<span data-op=next>»</span>
				</div>
				${unsafeHTML(this.buildMonth(next))}
				<div class=time><label>End time</label> <input type=time name=end_time value="${this.formatTime(this.ts.le, '23:59')}"></div>
			</div>
			<div>
				<ul class=shortcuts @click=${this.shortcut}>
					${Object.keys(SHORTCUTS).map((v) => html`<li data-op=${v}>${SHORTCUTS[v]}`)}
				</ul>
				<input data-op=apply type=button value=apply> <input data-op=clear type=button value=clear>
			</div>
		</div>`;
	}

	renderMonthPicker() {
		const current = this._current;
		const month = current.getUTCMonth();

		return html`<div class=picker @click=${this.click}>
			<div class=monthPicker>
				<div>${months.map((m, i) => {
					return i === month ? html`<div class=selected data-op=${i}>${m}</div>` : html`<div data-op=${i}>${m}</div>`;
				})}</div>
				<div>
					<input type=number name=year value=${current.getUTCFullYear()}>
					<input type=button value=ok data-op=ok>
				</div>
			</div>
		</div>`;
	}

	buildMonth(date) {
		const year = date.getUTCFullYear();
		const month = date.getUTCMonth();

		let rangeStart = 0
		if (this.ts.ge) {
			rangeStart = this.ts.ge.getTime();
			rangeStart -= rangeStart % 86400000; // strip out time
		}

		let rangeEnd = 0
		if (this.ts.le) {
			rangeEnd = this.ts.le.getTime();
			rangeEnd -= rangeEnd % 86400000;
		}

		const first = new Date(Date.UTC(year, month, 1));
		const last = new Date(Date.UTC(year, month+1, 0));

		const firstDayOfWeek = first.getUTCDay();
		const dayCount = last.getUTCDate();
		const weeks = Math.ceil((dayCount + firstDayOfWeek) / 7);

		let previousMonthDay = new Date(Date.UTC(year, month, 0)).getUTCDate() - firstDayOfWeek + 1;

		let day = 1;
		let str = '<table><tr><th>S<th>M<th>T<th>W<th>T<th>F<th>S<tr>';
		// the first week
		for (let i = 0; i < 7; i++) {
			if (i >= firstDayOfWeek) {
				str += this.dayCell(year, month, day++, '', rangeStart, rangeEnd);
			} else {
				str += this.dayCell(year, month-1, previousMonthDay++, 'oob', rangeStart, rangeEnd);
			}
		}

		// 2nd to last-1 week
		for (let i = 1; i < weeks-1; i++) {
			str += '<tr>'
			for (let j = 0; j < 7; j++) {
				str += this.dayCell(year, month, day++, '', rangeStart, rangeEnd);
			}
		}

		let nextMonthDay = 1;
		str += '<tr>';
		for (let i = 0; i < 7; i++) {
			if (day <= dayCount) {
				str += this.dayCell(year, month, day++, '', rangeStart, rangeEnd);
			} else {
				str += this.dayCell(year, month+1, nextMonthDay++, 'oob', rangeStart, rangeEnd);
			}
		}

		return str + '</table>';
	}

	dayCell(year, month, day, className, rangeStart, rangeEnd) {
		let str = '<td';

		const date = Date.UTC(year, month, day);
		if (date === rangeStart || (date >= rangeStart && date <= rangeEnd)) {
			className += ' selected';
		}

		if (className) {
			str += ` class="${className}"`;
		}

		return str + ` data-op=${date}>${day}`;
	}

	formatTime(date, dftl) {
		if (!date) return dftl;
		const hours = date.getUTCHours().toString().padStart(2, "0");
		const minutes = date.getUTCMinutes().toString().padStart(2, "0");
		return `${hours}:${minutes}`;
	}

	applyTime() {
		this.applyTimeTo(this.ts.ge, this.selector('input[name="start_time"]', '00:00'));
		this.applyTimeTo(this.ts.le, this.selector('input[name="end_time"]', '23:59'));
	}

	applyTimeTo(date, input, dflt) {
		if (!date || !input) return;
		const time = input.value === '' ? dflt : input.value;
		const parts = time.split(':');
		date.setUTCHours(parseInt(parts[0]));
		date.setUTCMinutes(parseInt(parts[1]));

		// not great, must be a better way to identify the user wants to the end of the day
		if (time === '23:59') {
			date.setUTCSeconds('59');
			date.setUTCMilliseconds('999');
		}
	}

	static styles = [
		this.css.form,
		css`
.wrap {
	position: relative;
}

input[name="display"] {
	width: 300px;
}

.picker {
	z-index: 2;
	position: absolute;
	right: 0;
	display: flex;
	gap: 10px;
	padding: 20px;
	background: #fff;
	user-select: none;
	border-radius: 4px;
	border: 1px solid #999;
}

.monthPicker {
	display: flex;
	width: 300px;
	flex-direction: column;
}

.monthPicker > div {
	display: flex;
	flex-wrap: wrap;
}

.monthPicker > div:first-of-type {
	margin-bottom: 20px;
}

.monthPicker > div > div {
	width: 32%;
	cursor: pointer;
	padding: 10px 0;
	flex-grow: 1;
	align-self: center;
	text-align: center;
	border-radius: 4px;
	border: 1px solid transparent;
}

.monthPicker > div > div:hover {
	color: ${unsafeCSS(this.css.hov.fg)};
	background: ${unsafeCSS(this.css.hov.bg)};
	border-color: ${unsafeCSS(this.css.hov.bd)};
}

.monthPicker > div > div.selected {
	color: ${unsafeCSS(this.css.sel.color)};
	background: ${unsafeCSS(this.css.sel.bg)};
	border-color: ${unsafeCSS(this.css.sel.bd)};
}

.monthPicker input {
	text-align: center;
	width: 100px;
	align-self: center;
}

.monthPicker input[type="button"] {
	cursor: pointer;
	margin-left: auto;
}

.datePicker {
	display: flex;
	flex-direction: column;
}

.datePicker .header {
	display: flex;
	color: #000;
	margin-bottom: 1px;
}

.datePicker .header span {
	cursor: pointer;
	padding: 0 10px;
	display: inline-block;
}

.datePicker .header div {
	width: 100%;
	text-align: center;
}

.datePicker .header span:hover {
	color: ${unsafeCSS(this.css.hi.fg)};
	background: ${unsafeCSS(this.css.hi.bg)};
	border-radius: 5px;
}

.datePicker table {
	background: #fff;
	border-spacing: 1px;
	white-space: nowrap;
	table-layout: fixed;
}

.datePicker th, td {
	padding: 5px 7px;
	text-align: center;
}

.datePicker th {
	font-weight: normal;
	padding-bottom: 0;
	color: ${unsafeCSS(this.css.hdr.fg)};
	background: ${unsafeCSS(this.css.hdr.bg)};
	border: 1px solid ${unsafeCSS(this.css.hdr.bd)};
}

.datePicker td {
	cursor: pointer;
	border: 1px solid #f0f0f0;
}

.datePicker td.oob {
	color: ${unsafeCSS(this.css.off.fg)};
	border-color: ${unsafeCSS(this.css.off.bd)};
	background: ${unsafeCSS(this.css.off.bg)};
}

.datePicker td:hover{
	color: ${unsafeCSS(this.css.hov.fg)};
	background: ${unsafeCSS(this.css.hov.bg)};
}

.datePicker td.selected {
	background: ${unsafeCSS(this.css.sel.bg)};
	border: 1px solid ${unsafeCSS(this.css.sel.bd)};
}

.datePicker .time {
	padding-top: 20px;
	align-self: center;
	margin-top: auto;
}

.shortcuts {
	width: 200px;
	max-height: 250px;
	padding-left: 5px;
	list-style: none;
	overflow-y: scroll;
	border-left: 1px solid #ccc;
}
.shortcuts li {
	padding: 5px;
	cursor: pointer;
	border-radius: 4px;
	border: 1px solid transparent;
}

.shortcuts li:hover {
	color: ${unsafeCSS(this.css.hov.fg)};
	background: ${unsafeCSS(this.css.hov.bg)};
	border: 1px solid ${unsafeCSS(this.css.hov.bd)};
}

.shortcuts input {
	width: 40px;
	padding: 2px;
}
.shortcuts select {
	padding: 2px;
}
input[data-op="clear"] {
	float: right;
}
		`];
}

customElements.define('logdk-daterange', DateRange);
