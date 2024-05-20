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
		case 'varchar':
		case 'blob':
		case 'enum':
		case 'uuid':
		case 'interval': return EQUALITY_FITER_HTML_LISTS;
		case 'boolean':
		case 'tinyint':
		case 'integer':
		case 'smallint':
		case 'bigint':
		case 'hugeint':
		case 'utinyint':
		case 'usmallint':
		case 'uinteger':
		case 'ubigint':
		case 'uhugeint':
		case 'real':
		case 'double':
		case 'date':
		case 'time':
		case 'timestamp':
		case 'timestamptz': return COMPARISON_FILTER_HTML_LISTS;
	}
	if (type.startsWith('decimal(')) return COMPARISON_FILTER_HTML_LISTS;

	// TODO, arrays?

	return '';
};

export { forValue, nameToOp };
