const dateFormat = {month: 'short', day: 'numeric', year: 'numeric'};

function dateTime(dt, long) {
	const date = dt.toLocaleDateString(undefined, dateFormat);
	// the first split gives us the time (with millisecond)
	// the secod split strips out the millisecond (and UTC timezone indicator)
	let time = dt.toISOString().split('T')[1];
	if (long !== true) {
		time = time.split('.')[0];
	}
	return date + ' ' + time;
}

function value(value) {
	if (value instanceof Date) {
		return dateTime(value);
	}
	return value;
}

function typed(value, type) {
	if (value === null) return null;
	switch (type) {
		case 'timestamp':
		case 'timestamptz':
			// micro to milli
			return new Date(value / 1000);
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

export { typed, value, relativeTime };
