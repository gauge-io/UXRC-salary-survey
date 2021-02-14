const concat = require( 'gulp-concat' );
const gulpIf = require( 'gulp-if' );

const stylesPATH = {
	dist: $.mode === 'dev-wp' ? $.pathWP + '/css/' : $.path + 'dist/css/',
	build: './build/css/',
};

const vendors_admin_css = () => $.src( [
	`${ $.vendors.admin }/**/*.css`,
] )
	.pipe( concat( 'vendors.admin.min.css' ) )
	.pipe( $.dest( $.mode === 'prod' ? stylesPATH.build : stylesPATH.dist ) )
	.pipe( gulpIf( $.mode === 'dev' || $.mode === 'dev-wp', $.server.reload( { stream: true, } ) ) );

module.exports = vendors_admin_css;
