@echo off
browserify index.js --standalone THREEPathDeform | uglifyjs > dist/three-path-deform.min.js
browserify index.js --standalone THREEPathDeform > dist/three-path-deform.js