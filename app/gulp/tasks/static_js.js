const gulpIf = require( 'gulp-if' );

const static_js = () => $.src( [ './src/static/js/**/*.*', ] )
	.pipe( gulpIf( $.mode === 'prod', $.dest( './build/static/js' ) ) )
	.pipe( gulpIf( $.mode === 'dev' || $.mode === 'dev-wp', $.dest( './dist/static/js' ) ) );

module.exports = static_js;
