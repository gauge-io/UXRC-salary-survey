const plumber = require( 'gulp-plumber' );
const pug = require( 'gulp-pug' );
const size = require( 'gulp-size' );
const gulpIf = require( 'gulp-if' );

const html_components = () => $.src( './src/pug/*.pug' )
	.pipe( plumber() )
	.pipe( pug( {
		pretty: true,
	} ) )
	.pipe( plumber.stop() )
	.pipe( size(
		{
			showFiles: true,
		}
	) )
	.pipe( $.dest( $.mode === 'prod' ? './build/' : './dist/' ) )
	.pipe( gulpIf( $.mode === 'dev', $.server.reload( { stream: true, } ) ) );

module.exports = html_components;
