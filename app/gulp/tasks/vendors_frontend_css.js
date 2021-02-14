const concat = require( 'gulp-concat' );
const gulpIf = require( 'gulp-if' );

const stylesPATH = {
	dist: $.mode === 'dev-wp' ? $.pathWP + '/css/' : $.path + 'dist/css/',
	build: './build/css/',
};

const vendors_frontend_css = () => $.src( [
	`${ $.vendors.frontend }/**/*.css`,
] )
	.pipe( concat( 'vendors.frontend.min.css' ) )
	.pipe( $.dest( $.mode === 'prod' ? stylesPATH.build : stylesPATH.dist ) )
	.pipe( gulpIf( $.mode === 'dev' || $.mode === 'dev-wp', $.server.reload( { stream: true, } ) ) );

module.exports = vendors_frontend_css;
