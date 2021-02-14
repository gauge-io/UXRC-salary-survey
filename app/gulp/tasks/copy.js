const gulpIf = require( 'gulp-if' );

const copy = () => $.src( [ './src/static/*.*', ] )
	.pipe( gulpIf( $.mode === 'prod', $.dest( './build/static' ) ) )
	.pipe( gulpIf( $.mode === 'dev' || $.mode === 'dev-wp', $.dest( './dist/static' ) ) );

module.exports = copy;
