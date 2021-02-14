const uglify = require( 'gulp-uglify' );
const plumber = require( 'gulp-plumber' );
const webpackStream = require( 'webpack-stream' );
const rename = require( 'gulp-rename' );
const gulpIf = require( 'gulp-if' );
const path = require( 'path' );
// const TerserPlugin = require( 'terser-webpack-plugin' );

const scriptsPATH = {
	src: './src/js/app.frontend.js',
	dist: $.mode === 'dev-wp' ? $.pathWP + '/js/' : $.path + 'dist/js/',
	build: './build/js/',
};

const webpackConfig = {
	mode: 'development',
	devtool: 'eval-source-map',
	// optimization: {
	// 	minimize: true,
	// 	minimizer: [ new TerserPlugin(), ],
	// },
	resolve: {
		modules: [
			// path.join( __dirname, '../../src/js/helpers' ),
			// path.join( __dirname, '../../components' ),
			path.join( __dirname, '../../node_modules' ),
		],
	},
	output: {
		filename: 'app.frontend.js',
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: '/node_modules/',
				use: {
					loader: 'babel-loader',
					options: {
					},
				},
			},
		],
	},
};

const js_frontend = () => $.src( scriptsPATH.src )
	.pipe( plumber() )
	.pipe( webpackStream( webpackConfig ) )
	.pipe( gulpIf( $.mode === 'prod', uglify() ) )
	.pipe( rename( { suffix: '.min', } ) )
	.pipe( $.dest( $.mode === 'prod' ? scriptsPATH.build : scriptsPATH.dist ) )
	.pipe( gulpIf( $.mode === 'dev' || $.mode === 'dev-wp', $.server.reload( { stream: true, } ) ) );

module.exports = js_frontend;
