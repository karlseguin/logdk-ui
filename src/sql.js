// Yes, for now we're inlining all the values. Since we allow the column names
// to be dynamic anyways, injection is always possible. This system is meant to
// be exposed to trusted users only.
// However, we expose an API that would allow us to generate a more abstract query
// with parameterized values, which could be passed to the backend. Thus, if we
// ever want to change how we encode a query, hopefully we only need to change
// this file and the backend, and not any callers of this file.
export class FilterBuilder {
	constructor() {
		this.str = '';
		this.logical = ' and '
	}

	and(cb) {
		this.group(' and ', cb);
	}

	group(logical, cb) {
		const prev = this.logical;

		this.logical = logical

		this.str += ' (';
		const len1 = this.str.length;
		cb()

		const len2 = this.str.length;
		if (len2  == len1) {
			this.str = this.str.substring(0, len1 - 2);
		} else {
			this.str = this.str.slice(0, -logical.length);
			this.str += ') ';
		}

		this.logical = prev;
	}

	infix(column, op, value) {
		this.str += `"${column}" ${op} ${this.value(value)} ${this.logical}`;
	}

	value(v) {
		if (v instanceof Date) {
			return `make_timestamptz(${v.getTime() * 1000})`;
		}
		return v;
	}
}
