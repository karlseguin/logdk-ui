import { css } from 'lit-element';

export default css`
.control {
	text-align: right;
	margin-bottom: 20px;
}

table{
	width: 100%;
	border-collapse: collapse;
}

th, td {
	padding: 4px;
}
th {
	text-align: left;
	border-bottom: 1px solid #aaa;
}

td {
	border-bottom: 1px solid #eee;
}

tr:hover td {
	background: #ffc;
}


tr.added td {
	background: #b1ffb1;
}

.action > div {
	cursor: pointer;
	padding: 2px;
	text-align: center;
}

.action .del {
	color: #fff;
	font-weight: bold;
	background: #ff503e;
}

.action .del:hover {
	background: #b33224;
}
`;
