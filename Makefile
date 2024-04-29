.PHONY: s
s:
	npx es-dev-server

.PHONY: d
d:
	rm -fr dist
	npx rollup -c rollup.config.mjs
	cp favicon.png dist/
	rm -fr dist/assets
