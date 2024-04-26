import { css } from 'lit-element';

export default css`
*, *::before, *::after {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}

a {
	text-decoration: none;
}

ul, ol {
	list-style: none;
}

h1, h2, h3, h4 {
	text-wrap: balance;
}

img, picture {
	max-width: 100%;
	display: block;
}

:target {
	scroll-margin-block: 5ex;
}
`;
