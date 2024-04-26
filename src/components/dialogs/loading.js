import { ContextError } from 'error';
import { Element, html, css } from 'components/base';

class Loading extends Element {
	static properties = {
	};

	render() {
		return html`<div><slot></slot><div class=loader></div></div>`;
	}

	static styles = [
		css`
:host > div {
	top: 30%;
	left: 50%;
	position: fixed;
	z-index: 2;
	display: flex;
	align-items: center;
	flex-direction: column;
	padding: 20px 40px;
	border-radius: 4px;
	background: #f0f0f0;
	border: 1px solid #e0e0e0;
	transform: translate(-50%, -30%);

}
.loader, .loader:before, .loader:after {
	width: 8px;
	display: grid;
	aspect-ratio: .5;
	background: radial-gradient(#000 68%,#0000 72%) center/100% 50% no-repeat;
	animation: load 1.2s infinite linear calc(var(--_s,0)*.4s);
	transform: translate(calc(var(--_s,0)*150%));
}
.loader:before, .loader:after {
	content: "";
	grid-area: 1/1;
}
.loader:before {--_s: -1}
.loader:after  {--_s:  1}

@keyframes load {
	20% {background-position: top}
	40% {background-position: bottom}
	60% {background-position: center}
}`
	];
}

customElements.define('logdk-loading', Loading);
