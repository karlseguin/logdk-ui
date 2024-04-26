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
	if (value === null) return 'null';
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
	if (!op || op.length < 4) return null;

	const n = new Date();
	const type = op.substring(0, 4);
	const data = op.substr(4);

	if (type === 'min-') {
		// 60 000 -> minutes to milliseconds

		return [new Date(n - parseInt(data) * 60000), n];
	}

	if (type !== 'rel-') {
		return null;
	}

	let gte, lte;

	switch(data) {
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
		breal;
	default:
		return null;
	}

	return [gte, lte];
}

export { typed, value, relativeTime };
