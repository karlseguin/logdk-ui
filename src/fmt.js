const intlDate = new Intl.DateTimeFormat(undefined, {month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'});
const intlTime = new Intl.DateTimeFormat(undefined, {timeZone: 'UTC', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false});

function escapeHtml(html) {
	return html.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function value(v, escape, full) {
	if (v === null) {
		return 'null';
	}

	if (v instanceof Date) {
		return date(v);
	}

	if (escape && typeof(v) === 'string') {
		return escapeHtml(v);
	}

	if (typeof(v) === 'object') {
		if (Array.isArray(v)) {
			if (v.length == 0) return full ? '' : '[]';
			let str = '[' + value(v[0], escape, full);
			for (let i = 1; i < v.length; i++) {
				str += ',' + value(v[i], escape);
			}
			return str + ']';
		}
		switch (v.type) {
		case 'time': return full ? v.value : v.value.slice(0, -7);
		default: return v;
		}
	}
	return v.toString();
}

function date(dt) {
	return intlDate.format(dt) + ' ' + intlTime.format(dt);
}

function typed(value, type) {
	if (value === null) return null;
	if (type.endsWith('[]')) {
		type = type.slice(0, -2);
		return value.map((v) => typed(v, type));
	}
	switch (type) {
		case 'timestamp':
		case 'timestamptz':
			// micro to milli
			return new Date(value / 1000);
		case 'time': return {type: 'time', value: value};
		case 'varchar':
			if (value.length > 10 && value[4] == '-' && value[7] == '-') {
				const date = new Date(value);
				if (isNaN(date) == false) return date;
			}
			break;
	}

	return value;
}

function relativeTime(op) {
	if (!op) return null;

	const n = new Date();
	const mins = parseInt(op);
	if (isNaN(mins) == false) {
		return [new Date(n - mins * 60000), n];
	}

	let gte, lte;
	switch(op) {
	case 't':
		lte = n;
		gte = new Date(n.getTime() - n.getTime() % 86400000);
	case 'y':
		lte = new Date(n.getTime() - n.getTime() % 86400000 - 1000);
		gte = new Date(lte.getTime() - 86400000 + 1000);
		break;
	case 'cm':
		lte = n;
		gte = new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), 1));
		break;
	case 'lm':
		lte = new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), 0, 23, 59, 59, 999));
		gte = new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth()-1, 1));
		break;
	case 'ytd':
		lte = n;
		gte = new Date(Date.UTC(n.getUTCFullYear(), 0, 1));
		break;
	default:
		return null;
	}

	return [gte, lte];
}

export { typed, value, date, relativeTime };
