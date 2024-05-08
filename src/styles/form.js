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
`;
