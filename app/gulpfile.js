const { src, dest, parallel, series, watch, } = require( 'gulp' );

global.$ = {
	src,
	dest,

	// mode
	mode: 'dev', // prod|dev|dev-wp

	// assets
	path: './',
	pathWP: '../wordpress/wp-content/themes/custom_theme',
	pathPlugins: '../wordpress/wp-content/plugins',

	// vendors
	vendors:{
		admin: './src/vendors/admin',
		frontend: './src/vendors/frontend',
	},

	// browsersync
	serve: './dist',
	serveWP: 'localhost/projects/',
	server: require( 'browser-sync' ).create(),
};

console.log( 'gulp mode:', $.mode );

const clean = require( './gulp/tasks/clean' );

const html_pages = require( './gulp/tasks/html_pages' );
const html_components = require( './gulp/tasks/html_components' );
const js_admin = require( './gulp/tasks/js_admin' );
const js_frontend = require( './gulp/tasks/js_frontend' );
const css_frontend = require( './gulp/tasks/css_frontend' );
const css_admin = require( './gulp/tasks/css_admin' );
const images = require( './gulp/tasks/images' );
const fonts = require( './gulp/tasks/fonts' );
const svg = require( './gulp/tasks/svg' );
const server = require( './gulp/tasks/server' );
const serverWP = require( './gulp/tasks/server-wp' );
const serverReload = require( './gulp/tasks/server-reload' );
const modeProduction = require( './gulp/tasks/mode_production' );
const vendors_admin_js = require( './gulp/tasks/vendors_admin_js' );
const vendors_admin_css = require( './gulp/tasks/vendors_admin_css' );
const vendors_frontend_js = require( './gulp/tasks/vendors_frontend_js' );
const vendors_frontend_css = require( './gulp/tasks/vendors_frontend_css' );
const copy = require( './gulp/tasks/copy' );
const datasets = require('./gulp/tasks/datasets');
const static_js = require('./gulp/tasks/static_js');

const watching = () => {
	watch(
		[ './src/pug/**/*.pug', ],
		series( html_pages )
	);

	watch(
		[ './src/components/**/*.pug', ],
		series( html_components )
	);

	watch(
		[
			'./src/components/**/*.scss',
			'./src/sass/**/*.scss',
			'./src/sass/bootstrap/_bootstrap.scss',
			'./src/sass/mixins/*.scss',
		],
		{ delay: 500, },
		series( css_frontend )
	);

	watch(
		[ './src/static/images/**/*.{png,jpg,gif,svg}', ],
		series( images )
	);

	watch(
		[ './src/static/svg/*.svg', ],
		series( svg )
	);

	watch(
		[
			'./src/js/app.frontend.js',
			'./src/components/**/*.js',
			'./src/js/_aux.js',
			// './src/components/store/*.js',
			// './src/components/input-file/*.js',
		],
		series( js_frontend )
	);

	// vendors
	watch(
		[
			`${ $.vendors.frontend }/**/*.js`,
		],
		series( vendors_frontend_js )
	);
	watch(
		[
			`${ $.vendors.frontend }/**/*.css`,
		],
		series( vendors_frontend_css )
	);

	// copy files
	// watch(
	// 	[
	// 		'./src/static/favicon.ico',
	// 	],
	// 	series( copy )
	// );
};

const dev = series( clean, parallel( html_pages, fonts, copy, datasets, static_js, vendors_frontend_css, css_frontend, images, vendors_frontend_js, svg ), js_frontend );
const build = series( modeProduction, clean, parallel( html_pages, copy, datasets, static_js, fonts, vendors_frontend_css, css_frontend, vendors_frontend_js, images, svg ), js_frontend );

exports.clean = clean;
exports.html_pages = html_pages;
exports.html_components = html_components;
exports.js_frontend = js_frontend;
exports.css_frontend = css_frontend;
exports.images = images;
exports.fonts = fonts;
exports.svg = svg;
exports.server = server;
exports.datasets = datasets;
exports.static_js = static_js;
exports.build = build;

switch( $.mode ){
case 'dev':
	exports.default = series( dev, parallel( watching, server ) );
	break;
case 'dev-wp':
	exports.default = series( devWP, parallel( watchingWP, serverWP ) );
	break;
default:
	exports.default = series( dev, parallel( watching, server ) );
}