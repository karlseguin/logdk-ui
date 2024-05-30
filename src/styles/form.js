import { css } from 'lit-element';

export default css`
select {
	height: 100%;
}
input, select, textarea {
	border: 1px solid #bbb;
	border-radius: 4px;
	padding: 6px 10px;
}
input[type="button"] {
	cursor: pointer;
	background: #ffc;
	border-color: #d3d388;
	box-shadow: 2px 2px 2px #ddd;
}
input[type="button"]:hover {
	box-shadow: none;
	background: #fffaa8;
}
input[type="button"].small {
	padding: 2px 10px;
}
input[type="checkbox"] {
	width: 20px;
	height: 20px;
}

form {width: 600px;}

.field {
	display: flex;
	padding: 5px;
	border-bottom: 1px solid #f0f0f0;
	margin-bottom: 5px
}

.field label {
	flex: 1;
	flex-basis: 100%;
	padding-right: 10px;
}

.field:has(label > span) {
	border-bottom-color: red;
}

.field label span {
	color: #f00;
}
.field > * {
	align-self: center;
}

form .buttons {
	margin: 5px 0;
	text-align: right;
}
`;
