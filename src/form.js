import { html } from 'lit-element';

const STATE_START = 0;
const STATE_OK = 1;
const STATE_INVALID = 2;
const STATE_UNKNOWN = 3;

export class Form {
	constructor() {
		this._errors = {};
		this._state = STATE_START;
	}

	process(res) {
		const body = res.body;
		const status = res.status;

		if (status === 400 && body.code === 5) {
			this._errors = body.validation.reduce((acc, val) => {
				acc[val.field] = val.err;
				return acc;
			}, {});
			this._state = STATE_INVALID;
			return;
		}
		this._errors = {};

		if (status === 200 || status === 204) {
			this._state = STATE_OK;
			return;
		}

		this._state = STATE_UNKNOWN;
	}

	renderError(field) {
		const err = this._errors[field];
		return (err === undefined) ? '' :  html` <span>${err}</span>`;
	}

	isSuccess() {
		return this._state == STATE_OK;
	}
}
