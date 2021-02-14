const plumber = require( 'gulp-plumber' );
const sass = require( 'gulp-sass' );
const autoprefixer = require( 'gulp-autoprefixer' );
const csso = require( 'gulp-csso' );
const sourcemaps = require( 'gulp-sourcemaps' );
const rename = require( 'gulp-rename' );
const sassGlob = require( 'gulp-sass-glob' );
const gulpIf = require( 'gulp-if' );

const stylesPATH = {
	src: './src/sass/styles.admin.scss',
	dist: $.mode === 'dev-wp' ? $.pathWP + '/css/' : $.path + 'dist/css/',
	build: './build/css/',
};

const css_admin = () => $.src( stylesPATH.src )
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
	.pipe( rename( 'styles.admin.min.css' ) )
	.pipe( $.dest( $.mode === 'prod' ? stylesPATH.build : stylesPATH.dist ) );

module.exports = css_admin;
