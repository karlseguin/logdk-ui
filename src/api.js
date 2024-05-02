import { ContextError } from 'error';
import { encodeMap } from 'url';

export class Api {
	async describe(opts) {
		return request('/api/1/describe', opts);
	}

	async getEvents(dataset, filters, opts) {
		return request(`/api/1/datasets/${dataset}/events?${encodeMap(filters)}`, opts);
	}
};

function request(url, opts) {
	let body = null;
	let status = 0;
	let isJson = false;

	return fetch(url, opts).then((r) => {
		status = r.status;
		if (status === 204) return {status: status, body: null};
		isJson = r.headers.get('Content-Type').includes('application/json');
		// dont' use r.json() because we want to read the body so we can display
		// a detailed error should parsing fail.
		return r.text();
	}).then((b) => {
		body = b;
		if (status !== 201 && status !== 200) {
			throw new Error('invalid status');
		}
		return {status: status, body: isJson ? JSON.parse(b) : b};
	}).catch((err) => {
		throw new ContextError(err.message, {
			method: opts.method || 'GET',
			url: url,
			src: 'api.request',
			status: status,
			body: body,
		});
	})
}
