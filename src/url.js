function encodeQuerystring(data) {
	const keys = Object.keys(data).sort();
	let qs = '?';
	for (let i = 0; i < keys.length; ++i) {
		const key = keys[i];
		qs += encodeURIComponent(key) + '=' + encodeURIComponent(data[key]) + '&';
	}
	return qs.length == 1 ? '' : qs.slice(0, -1);
}

function pushQuery(data) {
	history.pushState({}, "", encodeQuerystring(data));
}

function parseQuery() {
	let params = {};
	const search = window.location.search;
	if (search.length === 0) {
		return params
	}

	const parts = search.substring(1).split('&');
	for (let i = 0; i < parts.length; i++) {
		const pair = parts[i].split('=');
		params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
	}
	return params;
}

export { pushQuery, parseQuery, encodeQuerystring };
