.PHONY: s
s:
	npx es-dev-server

.PHONY: d
d:
	rm -fr dist
	npx rollup -c rollup.config.mjs
