import { Element, html, css } from 'components/base';

export class DataSets extends Element {
	render() {
		return html`
			<section>
				<h3>DataSets</h3>
				${ this.datasets.map((ds) => {
					return html`<div>
						<label>${ds.name}</label>
						<div><input type=button value=edit class=small></div>
					</div>`;
				})}
			</section>
		`;
	}

	static styles = [
		this.css.reset,
		this.css.form,
		css `
:host {
	display: flex;
}
		`
	]
}

customElements.define('logdk-admin-datasets', DataSets);
