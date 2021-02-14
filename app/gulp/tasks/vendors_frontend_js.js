const uglify = require( 'gulp-uglify' );
const concat = require( 'gulp-concat' );
const gulpIf = require( 'gulp-if' );

const scriptsPATH = {
	dist: $.mode === 'dev-wp' ? $.pathWP + '/js/' : $.path + 'dist/js/',
	build: './build/js/',
};

const vendors_frontend_js = () => $.src( [
	`${ $.vendors.frontend }/**/*.js`,
] )
	.pipe( concat( 'vendors.frontend.min.js' ) )
	.pipe( uglify() )
	.pipe( $.dest( $.mode === 'prod' ? scriptsPATH.build : scriptsPATH.dist ) )
	.pipe( gulpIf( $.mode === 'dev' || $.mode === 'dev-wp', $.server.reload( { stream: true, } ) ) );

module.exports = vendors_frontend_js;
