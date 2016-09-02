var browserify = require('browserify');
var browserifyCss = require('browserify-css');
var babelify = require("babelify");
var fs = require("fs");
var zlib = require('zlib');
var collapse = require('bundle-collapser/plugin');

var argv = {
	css: false,
	gz: false
}

callTime('\x1b[36mrunning\x1b[0m');

var dirname = "./public/";
var fileD = dirname + "index";
var fileS = "./src/";

bundle(fileS,fileD,global);

function bundle(fileS,fileD,global) {
	fs.closeSync(fs.openSync(fileD + ".js", 'w'));
	if (argv.css) {
		fs.closeSync(fs.openSync(fileD + ".css", 'w'));
	}
	var bundler = new browserify(
		'index.jsx',
		{debug:false,fullPaths:false,basedir:fileS}
	);

	bundler
		.plugin(collapse)
		.transform(babelify.configure({presets: ["es2015", "react"]}))
		.transform(browserifyCss, {
			rootDir: fileS,
			minify: true,
			minifyOptions: {
				keepBreaks: false,
				keepSpecialComments: 0,
				advanced: true,
				aggressiveMerging: true,
				mediaMerging: true,
				restructuring: true,
				semanticMerging: false,
				shorthandCompacting: true
			},
			onFlush: function(options, done) {
				if (!argv.css) { 
					done(null);
				} else {
					fs.appendFileSync(fileD + ".css", options.data,{ encoding: 'utf8' });
					done(null);
				}
			}
		})
		.transform({ sourcemap: false, global: true }, 'uglifyify')
		.bundle()
		.on("error", function (err) {
			callTime("\033[31mBundler Error");
			console.log(err.message + '\x1b[0m');
		})
		.pipe(fs.createWriteStream(fileD + ".js",{ encoding: 'utf8' }))
		.on("finish",function() {
			onFinish(this);
			if (argv.css) {
				onFinish({path:fileD+".css"});
			}
		})
	;
}

function onFinish(f) {
	if (!fs.existsSync(f.path)) {
		callTime('\033[31m' + f.path + ' failed' + '\x1b[0m');
	} else {
		callTime('\033[32m' + f.path + ' created' + '\x1b[0m');
		if (argv.gz) {
			var gz = zlib.createGzip();
			var inp = fs.createReadStream(f.path);
			inp.pipe(gz)
				.pipe(fs.createWriteStream(f.path + ".gz"))
				.on("finish",function() {
					callTime('\033[32m' + this.path + ' created' + '\x1b[0m');
				})
			;
		}
	}
}

function ucfirst (str) {
  str += '';
  var f = str.charAt(0).toUpperCase();
  return f + str.substr(1);
}

var now;

function prefix(text) {
	var length = 0;
	if (text && now.toString().length > text.length) {
		length += (now.toString().length - text.length);
	}
	var nothing = ' ';
	text = nothing.repeat(length) + text;
 	return '[' + text + '] ';
}
function callTime(text) {
	var callnow = Date.now();
	if (now == undefined) {
		var time = callnow;
		now = callnow;
	} else {
		var duration = (callnow - now) / 1000;
		var time = " + " + duration;
	}
	console.log(prefix(time) + text);
}
