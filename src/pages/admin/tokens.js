import { Task } from '@lit/task';
import { Element, html, css } from 'components/base';
import {classMap} from 'lit/directives/class-map.js';

import * as fmt from 'fmt';
import { ContextError } from 'error';

export class Tokens extends Element {
	constructor() {
		super();
		this._added_id = null;
	}

	async addClick() {
		const res = await this.api.tokensCreate();
		if (res.status !== 201) {
			throw ContextError.fromRes(res)
		}
		this._added_id = res.body.id;
		this._listTokens.run();
	}

	async delClick(e) {
		const id = e.target.closest('[data-id]').dataset.id;
		const res = await this.api.tokensDelete(id);
		if (res.status !== 204) {
			throw ContextError.fromRes(res)
		}
		this._listTokens.run();
	}

	_listTokens = new Task(this, {
		task: async (_, {signal}) => {
			const res = await this.api.tokensList();
			if (res.status === 200) return res.body;
			throw ContextError.fromRes(res);
		},
		args: () => []
	});

	render() {
		return this._listTokens.render({
			complete: (result) => {
				return html`
					<div class=control>
						<input @click=${this.addClick} type=button value="create token">
					</div>
					${this.renderTokens(result.tokens)}
				`;
			},
			error: (err) => html`<logdk-error message="Failed to fetch tokens" .err=${err}></logdk-error>`,
		});
	}

	renderTokens(tokens) {
		if (tokens.length == 0) return html`<h5>There are no tokens in the system</h5>`;

		const added_id = this._added_id;
		return html`<table>
			<thead><th>key</td><th>created</th><th></th></thead>
			<tbody>
			${tokens.map((t) => {
				const id = t.id;
				const added = {added: id == added_id};
				return html`
					<tr class=${classMap(added)} data-id=${id}>
						<td>${id}</td>
						<td>${fmt.date(new Date(t.created / 1000))}</td>
						<td><div class=action><div class=del @click=${this.delClick}>x</div></div></td>
					</tr>`;
			})}
			</tbody></table>`;
	}

	static styles = [
		this.css.reset,
		this.css.crud,
		this.css.form,
		this.css.button,
	]
}
customElements.define('logdk-admin-tokens', Tokens);
