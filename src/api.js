import { encodeMap } from 'url';
import { ContextError } from 'error';

export class Api {
	async describe(opts) {
		return request('/api/1/describe', opts);
	}

	async getEvents(dataset, args, opts) {
		return request(`/api/1/datasets/${dataset}/events?${encodeMap(args)}`, opts);
	}

	async exec(args, opts) {
		return request(`/api/1/exec?${encodeMap(args)}`, opts);
	}

	async info(opts) {
		return request('/api/1/info', opts);
	}

	async sessionInfo(opts) {
		return request('/api/1/session', opts);
	}

	async saveSettings(settings) {
		return request('/api/1/settings', {method: 'POST', body: JSON.stringify(settings)});
	}

	async tokensList() {
		return request('/api/1/tokens', {});
	}

	async tokensCreate() {
		return request('/api/1/tokens', {method: 'POST'});
	}

	async tokensDelete(id) {
		return request(`/api/1/tokens/${id}`, {method: 'DELETE'});
	}

	async usersList() {
		return request('/api/1/users', {});
	}
	async userCreate(user) {
		return request('/api/1/users', {method: 'POST', body: JSON.stringify(user)});
	}
};

function request(url, opts) {
	let body = null;
	let status = 0;
	let isJson = false;

	return fetch(url, opts).then((r) => {
		status = r.status;
		if (status === 204) return {status: status, body: null};
		const ct = r.headers.get('Content-Type');
		isJson = ct && ct.includes('application/json');
		// don't use r.json() because we want to read the body so we can display
		// a detailed error should parsing fail.
		return r.text();
	}).then((b) => {
		body = isJson ? JSON.parse(b) : b;
		// if (status !== 201 && status !== 200) {
		// 	throw new Error(isJson && body.error ? body.error : 'invalid status');
		// }
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
