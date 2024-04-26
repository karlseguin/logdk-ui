class ContextError extends Error {
	constructor(message, ctx) {
		super(message);
		this.ctx = ctx;
		ctx.message = message;
	}

	static fromRes(res) {
		return new ContextError('Unexpected server response', {status: res.status, body: JSON.stringify(res.body)});
	}
};

export { ContextError };
