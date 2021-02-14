class App{
	constructor(){
	}
	init(){
		console.log( 'app.admin.min.js -> App -> init()' );

		// const svg = new InlineSVG();
		// svg.init();
	}

}

const app = new App();
document.addEventListener( 'DOMContentLoaded', app.init() );