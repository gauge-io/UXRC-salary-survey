
class App {
	constructor() {
	}

	init() {
		console.log( "app.frontend.min.js -> App -> init()" );

		barba.init( {
			debug: true,
			views: [
				// INDEX
				{
					namespace: "compensation",
					beforeEnter( data ) {
					},
					afterEnter( data ) {
					},
					beforeLeave( data ) {
						// console.log( 'SPA.js -> leaving index' );
					},
				},

				// CONFIG
				{
					namespace: "commutation",
					beforeEnter( data ) {
					},
					afterEnter( data ) {
					},
					beforeLeave( data ) {
					},
				},

				// ANALYZE
				{
					namespace: "correlation",
					beforeEnter( data ) {
					},
					afterEnter( data ) {
					},
					beforeLeave( data ) {
					},
				},
			],
			transitions: [
				{
					name: "page-transition",
					once( data ) {
						// console.log( 'SPA.js -> first load', data.next.container.dataset.barbaNamespace );
					},

					leave( data ) {},
					afterLeave( data ) {},
					enter( data ) {
						// console.log( 'barba: enter:', data.next.container.dataset.barbaNamespace );
					},
					afterEnter( data ) {},
					after( data ) {},
				},
			],
		} );

		this.initEventListeners();
	}

	initEventListeners() {
	}
}

const app = new App();
document.addEventListener( "DOMContentLoaded", app.init() );
