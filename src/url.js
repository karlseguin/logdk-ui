function encodeQuerystring(data) {
	const keys = Object.keys(data).sort();
	let qs = '';
	for (let i = 0; i < keys.length; ++i) {
		const key = keys[i];
		qs += encodeURIComponent(key) + '=' + encodeURIComponent(data[key]) + '&';
	}
	return qs;
}

function pushQuery(data) {
	history.pushState({}, '', '#' + encodeQuerystring(data));
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

export { pushQuery, parseQuery, encodeQuerystring };
