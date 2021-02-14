const del = require( 'del' );
const cache = require( 'gulp-cache' );

const clean = () => del( './build/*' ); cache.clearAll();

module.exports = clean;
