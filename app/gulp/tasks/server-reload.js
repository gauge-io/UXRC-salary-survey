const serverReload = ( done ) => {
	// console.log( $.server.name );
	$.server.reload();
	done();
};

module.exports = serverReload;
