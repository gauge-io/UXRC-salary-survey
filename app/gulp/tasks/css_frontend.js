const plumber = require( 'gulp-plumber' );
const sass = require( 'gulp-sass' );
const autoprefixer = require( 'gulp-autoprefixer' );
const csso = require( 'gulp-csso' );
const sourcemaps = require( 'gulp-sourcemaps' );
const rename = require( 'gulp-rename' );
const sassGlob = require( 'gulp-sass-glob' );
const gulpIf = require( 'gulp-if' );

const stylesPATH = {
	src: './src/sass/styles.frontend.scss',
	dist: $.mode === 'dev-wp' ? $.pathWP + '/css/' : $.path + 'dist/css/',
	build: './build/css/',
};

const css_frontend = () => $.src( stylesPATH.src )
	.pipe( plumber() )
	.pipe( sassGlob() )
	.pipe( gulpIf( $.mode === 'prod', sourcemaps.init() ) )
	.pipe( sass( { outputStyle: 'expanded', } ) )
	.pipe( gulpIf( $.mode === 'prod', sourcemaps.write() ) )
	.pipe( gulpIf(
		// $.mode === 'prod',
		true,
		autoprefixer( {
			overrideBrowserslist: [ 'last 3 versions', ],
		} )
	) )
	.pipe( gulpIf( $.mode === 'prod', csso() ) )
	.pipe( rename( 'styles.frontend.min.css' ) )
	.pipe( $.dest( $.mode === 'prod' ? stylesPATH.build : stylesPATH.dist ) )
	.pipe( gulpIf( $.mode === 'dev' || $.mode === 'dev-wp', $.server.reload( { stream: true, } ) ) );

module.exports = css_frontend;
