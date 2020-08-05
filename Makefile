.PHONY: test
test:
	watchexec -w src "clear && npm t"
