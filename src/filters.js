import { unsafeHTML } from 'lit/directives/unsafe-html.js';

const OPS = ['==', '!=', '<', '<=', '>', '>=', 'ts', 'between'];

const EQUALITY_FITER_HTML_LISTS = unsafeHTML(htmlLists(['==', '!=']).join(''));
const COMPARISON_FILTER_HTML_LISTS = unsafeHTML(htmlLists(['==', '!=', '<', '<=', '>', '>=']).join(''));

function htmlLists(ops) {
	return ops.map((op) => `<li data-op=${OPS.indexOf(op)}>${op}`);
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

function opToCode(op) { return OPS.indexOf(op); }

export { forValue, opToCode };
