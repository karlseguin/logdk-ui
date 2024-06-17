import { css } from 'lit-element';

export default css`
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

input[type="button"].flat {
	padding: 2px 5px;
	box-shadow: none;
}
`;
