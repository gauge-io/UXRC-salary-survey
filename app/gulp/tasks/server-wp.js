const serverWP = () => $.server.init({
	server: false,
	proxy: $.serveWP,
	port: 3000,
	timestamps: true,
	injectChanges: true, //Inject CSS changes
	notify: true,
	// logLevel: 'debug',
});

module.exports = serverWP;
