const gulpIf = require( 'gulp-if' );

const datasets = () => $.src( [ './src/datasets/**/*.*', ] )
	.pipe( gulpIf( $.mode === 'prod', $.dest( './build/datasets' ) ) )
	.pipe( gulpIf( $.mode === 'dev' || $.mode === 'dev-wp', $.dest( './dist/datasets' ) ) );

module.exports = datasets;
