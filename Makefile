.PHONY: test
test:
	watchexec -w src "clear && npm t"

filesize:
	@echo "raw:"
	@cat dist/boxset.cjs.production.min.js | wc -c
	@echo "gzip:"
	@gzip -9 -c dist/boxset.cjs.production.min.js | wc -c

source_files: src/index.ts

dist/boxset.cjs.development.js: source_files
	npx esbuild --bundle src/index.ts --outfile=$@ --sourcemap --target=node12 --format=cjs --minify-syntax

dist/boxset.cjs.production.min.js: source_files
	npx esbuild --bundle src/index.ts --outfile=$@ --sourcemap --target=node12 --format=cjs --minify

dist/boxset.esm.js: source_files
	npx esbuild --bundle src/index.ts --outfile=$@ --sourcemap --target=es2017 --format=esm --minify-syntax

.PHONY: esbuild
esbuild: dist/*

.PHONY: build
build:
	npm run build
	@$(MAKE) filesize
