const imagemin = require( 'gulp-imagemin' );
const cache = require( 'gulp-cache' );

const imgPATH = {
	input: [
		'./src/static/images/**/*.{png,jpg,gif,svg}',
		'!./src/static/svg/*',
	],
	build: './build/static/images/',
	dev: './dist/static/images/',
};

const images = () => $.src( imgPATH.input )
	.pipe(
		cache(
			imagemin( [
				imagemin.gifsicle( { interlaced: true, } ),
				imagemin.mozjpeg( { quality: 50, progressive: true, } ),
				imagemin.optipng( { optimizationLevel: 7, } ), // https://www.npmjs.com/package/imagemin-optipng
				imagemin.svgo(),
			], { verbose: true, } )
		)
	)
	.pipe( $.dest( $.mode === 'prod' ? imgPATH.build : imgPATH.dev ) );

module.exports = images;
