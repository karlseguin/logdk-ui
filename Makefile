.PHONY: s
s:
	npx es-dev-server

.PHONY: d
d:
	rm -fr dist
	npx rollup -c rollup.config.mjs
	cp favicon.png dist/
	perl -pi -e "s/logdk\.js/logdk.js?$$(shasum dist/logdk.js | head -c 12)/" dist/index.html
