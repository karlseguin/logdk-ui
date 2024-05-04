function encodeMap(data) {
	const keys = Object.keys(data).sort();
	let qs = '';
	for (let i = 0; i < keys.length; ++i) {
		const key = keys[i];
		qs += encodeURIComponent(key) + '=' + encodeURIComponent(data[key]) + '&';
	}
	// strip out trailing &
	return qs.length > 0 ? qs.slice(0, -1) : '';
}

function pushFragment(fragment) {
	history.pushState({}, '', '#' + fragment);
}

function parseQuery(qs) {
	let params = {};
	if (qs.length == 0) return params;
	if (qs[0] === '?' || qs[0] === '#') qs = qs.slice(1);

	const parts = qs.split('&');
	for (let i = 0; i < parts.length; i++) {
		const pair = parts[i].split('=');
		params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
	}
	return params;
}

export { pushFragment, parseQuery, encodeMap };
