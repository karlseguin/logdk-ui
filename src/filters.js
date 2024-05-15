import { unsafeHTML } from 'lit/directives/unsafe-html.js';

const OPS = ['==', '!=', '<', '<=', '>', '>=', 'rel', 'in'];
const CODES = ['e', 'n', 'l', 'le', 'g', 'ge', 'rel', 'in'];
const EQUALITY_FITER_HTML_LISTS = unsafeHTML(htmlLists(['==', '!=']).join(''));
const COMPARISON_FILTER_HTML_LISTS = unsafeHTML(htmlLists(['==', '!=', '<', '<=', '>', '>=']).join(''));

function htmlLists(ops) {
	return ops.map((op, i) => `<li data-op=${CODES[i]}>${op}`);
}

function nameToOp(name) {
	return OPS[CODES.indexOf(name)];
}

function forValue(type, value) {
	if (value == null) {
		return EQUALITY_FITER_HTML_LISTS;
	}

	switch (type) {
		case 'varchar': return EQUALITY_FITER_HTML_LISTS;
		case 'blob': return EQUALITY_FITER_HTML_LISTS;
		case 'boolean': return COMPARISON_FILTER_HTML_LISTS;
		case 'tinyint': return COMPARISON_FILTER_HTML_LISTS;
		case 'integer': return COMPARISON_FILTER_HTML_LISTS;
		case 'smallint': return COMPARISON_FILTER_HTML_LISTS;
		case 'bigint': return COMPARISON_FILTER_HTML_LISTS;
		case 'hugeint': return COMPARISON_FILTER_HTML_LISTS;
		case 'utinyint': return COMPARISON_FILTER_HTML_LISTS;
		case 'usmallint': return COMPARISON_FILTER_HTML_LISTS;
		case 'uinteger': return COMPARISON_FILTER_HTML_LISTS;
		case 'ubigint': return COMPARISON_FILTER_HTML_LISTS;
		case 'uhugeint': return COMPARISON_FILTER_HTML_LISTS;
		case 'real': return COMPARISON_FILTER_HTML_LISTS;
		case 'double': return COMPARISON_FILTER_HTML_LISTS;
		case 'date': return COMPARISON_FILTER_HTML_LISTS;
		case 'time': return COMPARISON_FILTER_HTML_LISTS;
		case 'timestamp': return COMPARISON_FILTER_HTML_LISTS;
		case 'enum': return EQUALITY_FITER_HTML_LISTS;
		case 'uuid': return EQUALITY_FITER_HTML_LISTS;
		case 'interval': return EQUALITY_FITER_HTML_LISTS;
	}
	if (type.startsWith('decimal(')) return COMPARISON_FILTER_HTML_LISTS;

	// TODO, arrays?

	return '';
};

export { forValue, nameToOp };
