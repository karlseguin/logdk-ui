import { Element, html, css, unsafeCSS } from 'components/base';
import { Task } from '@lit/task';

import 'components/dialogs';

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
		const duckdb = info.duckdb;

		const duckdbKeys = Object.keys(duckdb).sort();

		return html`<div>
			<h3>lodgk</h3>
			<div>
				<div class=f><label>logdk version</label><div>${logdk.version}</div></div>
				<div class=f><label>httpz mode</label><div>${logdk.httpz_blocking ? 'blocking' : 'nonblocking'}</div></div>
				<div class=f><label>source</label><div><a href="https://github.com/karlseguin/logdk">github</a></div></div>
				<div class=f><label>license</label><div><a href="https://github.com/karlseguin/logdk/blob/master/LICENSE">MIT</a></div></div>
			</div>

			<h3>duckdb</h3>
			<div>
				<div class=f><label>website</label><div><a href="https://duckdb.org/">https://duckdb.org/</a></div></div>
				<div class=f><label>source</label><div><a href="https://github.com/duckdb/duckdb">github</a></div></div>
				<div class=f><label>license</label><div><a href="https://github.com/duckdb/duckdb/blob/main/LICENSE">MIT</a></div></div>
				${duckdbKeys.map((k) => this.renderObject(duckdb[k]))}
			</div>
		</div>`;
	}

	renderObject(obj) {
		const keys = Object.keys(obj).sort();
		return keys.map((k) => html`<div class=f><label>${k}</label><div>${obj[k]}</div></div>`);
	}

	static styles = [
		this.css.reset,
		css`
:host > div {
	max-width: 500px;
	margin: 10px auto;
}

h3 {
	margin: 20px 0 0 0;
}

.f {
	display: flex;
	gap: 10px;

	flex-direction: row;
	padding: 4px;
	border-bottom: 1px solid #f0f0f0;
}

.f:nth-of-type(even) {
	background: #f6f6f6;
}

label {
	width: 175px;
}

// .f > div {
// 	margin-left: auto;
// }

		`
	]
}

customElements.define('logdk-info', Info);
