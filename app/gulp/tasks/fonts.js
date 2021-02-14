const fonts = () => $.src( './src/fonts/**/*.*' )
	.pipe( $.dest( './build/static/fonts/' ) );
module.exports = fonts;
