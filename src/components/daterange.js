import { Element, html, css } from 'components/base';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { relativeTime } from 'fmt';

const MONTHS = Array.from({length: 12}, (_, i) => new Date(2000, i, 1).toLocaleDateString(undefined, {'month': 'long'}));
const DISPLAY_FORMAT = {month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC'};
const SHORTCUTS = {
	'min-5': 'last 5 minutes',
	'min-15': 'last 15 minutes',
	'min-60': 'last hour',
	'min-240': 'last 4 hours',
	'min-720': 'last 12 hours',
	'min-1440': 'last 24 hours',
	'min-10080': 'last 7 days',
	'rel-y': 'yesterday',
	'rel-cm': 'current month',
	'rel-lm': 'last month',
	'rel-ytd': 'year to date',
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
				this.ts.lte = null;
				this.ts.rel = null;
				this.setGTE(new Date(parseInt(op)));
				this.applyTime();
			} else {
				this.ts.lte = new Date(parseInt(op));
				this.applyTime();
				if (this.ts.lte < this.ts.gte) {
					const x = this.ts.lte;
					this.ts.lte = this.get;
					this.setGTE(x);
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

		const [gte, lte] = result;
		this.ts.lte = lte;
		this.setGTE(gte);

		this.ts.rel = op;
		this.close(true);
	}

	setGTE(date) {
		this.ts.gte = date;
		this._current = new Date(date.getTime()); // don't set to this.gte as we mutate _current
	}

	render() {
		this._current = this._current ?? this.ts?.gte;
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
		if (ts.gte) {
			str += ts.gte.toLocaleString(undefined, DISPLAY_FORMAT);
		}
		if (ts.lte) {
			if (!ts.gte) str += '∞'
			str += ' - ' + ts.lte.toLocaleString(undefined, DISPLAY_FORMAT);
		} else if (ts.gte) {
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
				<div class=time><label>Start time</label> <input type=time name=start_time value="${this.formatTime(this.ts.gte, '00:00')}"></div>
			</div>
			<div class=datePicker>
				<div class=header>
					<div><span data-op=m2>${MONTHS[next.getUTCMonth()]} ${next.getUTCFullYear()}</span></div>
					<span data-op=next>»</span>
				</div>
				${unsafeHTML(this.buildMonth(next))}
				<div class=time><label>End time</label> <input type=time name=end_time value="${this.formatTime(this.ts.lte, '23:59')}"></div>
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
		if (this.ts.gte) {
			rangeStart = this.ts.gte.getTime();
			rangeStart -= rangeStart % 86400000; // strip out time
		}

		let rangeEnd = 0
		if (this.ts.lte) {
			rangeEnd = this.ts.lte.getTime();
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
		this.applyTimeTo(this.ts.gte, this.selector('input[name="start_time"]', '00:00'));
		this.applyTimeTo(this.ts.lte, this.selector('input[name="end_time"]', '23:59'));
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
	color: ${this.css.hover.color};
	background: ${this.css.hover.background};
	border-color: ${this.css.hover.border};
}

.monthPicker > div > div.selected {
	color: ${this.css.selected.color};
	background: ${this.css.selected.background};
	border-color: ${this.css.selected.border};
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
	color: ${this.css.control.color};
	background: ${this.css.control.background};
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
	background: ${this.css.header.background};
	border: 1px solid ${this.css.header.border};
}

.datePicker td {
	cursor: pointer;
	border: 1px solid #f0f0f0;
}

.datePicker td.oob {
	color: ${this.css.disabled.color};
	border-color: ${this.css.disabled.border};
	background: ${this.css.disabled.background};
}

.datePicker td:hover{
	background: ${this.css.hover.background};
}

.datePicker td.selected {
	background: ${this.css.selected.background};
	border: 1px solid ${this.css.selected.border};
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
	background: ${this.css.hover.background};
	border: 1px solid ${this.css.hover.border};
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
