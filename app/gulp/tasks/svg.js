const svgSprite = require( 'gulp-svg-sprite' );
const svgmin = require( 'gulp-svgmin' );
// const cheerio = require( 'gulp-cheerio' );
// const replace = require( 'gulp-replace' );

const svgPath = {
	input: './src/static/svg/*.svg',
	dist: './dist/static/svg/',
	build: './build/static/svg/',
};

const svg = () => $.src( svgPath.input )
	.pipe( svgmin( {
		js2svg: {
			pretty: true,
		},
	} ) )
// .pipe( cheerio( {
// run( $ ) {
// $( '[fill]' ).removeAttr( 'fill' );
// $( '[stroke]' ).removeAttr( 'stroke' );
// $( '[style]' ).removeAttr( 'style' );
// },
// parserOptions: { xmlMode: true, },
// } ) )
// .pipe( replace( '&gt;', '>' ) )
	.pipe( svgSprite( {
		mode: {
			symbol: {
				sprite: 'sprite.svg',
			},
		},
	} ) )
	.pipe( $.dest( $.mode === 'prod' ? svgPath.build : svgPath.dist ) );

module.exports = svg;
