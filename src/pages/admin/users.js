import { Element, html, css } from 'components/base';

import { Form } from 'form';
import 'components/dialogs';

export class Settings extends Element {
	constructor() {
		super();
		this._form = new Form();
	}
	async click() {
		const settings = {
			create_tokens: this.selector('#create_tokens').checked,
			dataset_creation: this.selector('#dataset_creation').checked,
		}
		const res = await this.api.saveSettings(settings);
		this._form.process(res);
		if (this._form.isSuccess()) {
			// brute force, but this is a simple way to redraw the UI across all loaded
			// components based on the new settings
			top.location.href = top.location.pathname + '?success';
		} else {
			this.update();
		}
	}

	render() {
		return html`
			<form method=post>
			<h3>Settings</h3>
			<div class=field>
				<label for=dataset_creation>dynamic dataset creation${this._form.renderError('dataset_creation')}</label>
				<input id=dataset_creation type=checkbox ?checked=${this.settings.dataset_creation}>
			</div>

			<div class=field>
				<label for=create_tokens>POST /api/1/events requires token${this._form.renderError('create_tokens')}</label>
				<input id=create_tokens type=checkbox ?checked=${this.settings.create_tokens}>
			</div>

			<div class=buttons>
				<input type=button value=save @click="${this.click}">
			</div>
			${this.isSuccess() ? html`<logdk-notice>system updated</logdk-notice>` : ''}
		</form>`;
	}

	isSuccess() {
		return top.location.search === '?success';
	}

	static styles = [
		this.css.reset,
		this.css.form,
	]
}
customElements.define('logdk-admin-users', Settings);
