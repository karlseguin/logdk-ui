import { Element, html, css, unsafeCSS } from 'components/base';
import { Task } from '@lit/task';

import 'components/dialogs';
import { ContextError } from 'error';

export class Info extends Element {
	_info = new Task(this, {
		task: async (_, {signal}) => {
			const res = await this.api.info({signal: signal});
			if (res.status === 200) return res.body;
			throw ContextError.fromRes(res);
		},
		args: () => []
	});

	render() {
		return this._info.render({
			pending: () => html`<logdk-loading>Loading system info</logdk-loading>`,
			complete: (info) => this.renderInfo(info),
			error: (err) => html`<logdk-error message="Failed to fetch information about the system" .err=${err}></logdk-error>`,
		});
	}

	renderInfo(info) {
		const logdk = info.logdk;
		const version = logdk.version.split('\n');

		const duckdb = info.duckdb;
		const duckdbKeys = Object.keys(duckdb).sort();

		return html`
			<section>
				<h3>lodgk</h3>
				<div><label>logdk version</label><div>${version[0].split(':')[1].substr(0, 10)}</div></div>
				<div><label>zig version</label><div>${version[1].split(':')[1]}</div></div>
				<div><label>ui version</label><div>${version[2].split(':')[1].substr(0, 10)}</div></div>
				<div><label>httpz mode</label><div>${logdk.httpz_blocking ? 'blocking' : 'nonblocking'}</div></div>
				<div><label>source</label><div><a href="https://github.com/karlseguin/logdk">github</a></div></div>
				<div><label>license</label><div><a href="https://github.com/karlseguin/logdk/blob/master/LICENSE">MIT</a></div></div>
			</section>

			<section>
				<h3>duckdb</h3>
				<div><label>website</label><div><a href="https://duckdb.org/">https://duckdb.org/</a></div></div>
				<div><label>source</label><div><a href="https://github.com/duckdb/duckdb">github</a></div></div>
				<div><label>license</label><div><a href="https://github.com/duckdb/duckdb/blob/main/LICENSE">MIT</a></div></div>
				${duckdbKeys.map((k) => this.renderObject(duckdb[k]))}
			</section>
		`;
	}

	renderObject(obj) {
		const keys = Object.keys(obj).sort();
		return keys.map((k) => html`<div><label>${k}</label><div>${obj[k]}</div></div>`);
	}

	static styles = [
		this.css.reset,
		css`
section {
	padding: 0 10px;
	max-width: 600px;
	margin: 10px auto;
}

h3 {
	margin-top: 20px;
}

section > div {
	display: flex;
	padding: 5px;
	border-bottom: 1px solid #f0f0f0;
}

section > div:nth-of-type(even) {
	background: #f6f6f6;
}

section > div > * {
	flex: 1;
}
		`
	]
}

customElements.define('logdk-info', Info);
