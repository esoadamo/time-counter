all: compile

clean:
		rm -rf dist/

compile:
		node ../../QRGames/util-games-builder/build-game.js game.html

run:
		node ../../QRGames/util-games-builder/build-game.js game.html run

debug:
		node ../../QRGames/util-games-builder/build-game.js game.html debug

autobuild:
		node ../../QRGames/util-games-builder/run-from-source.js game.html

autobuild-local:
		node ../../QRGames/util-games-builder/run-from-source.js  --web-libs=../../QRGames/web-libs/ --web-path=../../QRGames/web-qrpr.eu/ game.html

.PHONY: clean compile run debug
.SILENT:
