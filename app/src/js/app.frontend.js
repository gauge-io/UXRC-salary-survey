import {
	getDataset,
	getGroupedData,
	getQuantileData,
	renderCompensation,
	renderCurrencyFilter,
	getFilterValues,
	getFilters,
	applyFiltersOnData,
	addMapStyleProperties,
	getGeoJSONArcDataset,
	getGeoJSONPointDataset,
	getUniqueOfficeLocations,
	getOfficeToResidenceArcsDataset
} from "./_aux.js";

// mapbox token
mapboxgl.accessToken =
	"pk.eyJ1IjoiaWFzaGlzaHNpbmdoIiwiYSI6ImNra2dweDA5aTE1czMydW1ucGxkYTdtY2sifQ.mbkBR2PjRtKrpAw59dvJ_g";

class App {
	constructor() {
		this.dispatch = d3.dispatch("filterChanged", "dataAvailable");
		this.data = null;

		this.map;

		getDataset().then((data) => {
			this.data = data;
			this.dispatch.apply("dataAvailable");
			console.log("data", data);
		});
	}

	init() {
		console.log("app.frontend.min.js -> App -> init()");
		const dispatch = this.dispatch;
		const app = this;

		barba.init({
			debug: true,
			views: [
				// INDEX
				{
					namespace: "index",
					beforeEnter(data) {},
					afterEnter(data) {
						document.querySelector( '[data-page="compensation"]' ).classList.add( 'active' );

						console.log("data", data);

						renderCurrencyFilter("select[data-metric=currency]");

						// Render Graph
						dispatch.on("filterChanged.compensation", (oPayload) => {
							setTimeout(() => {
								app.compensation();
							}, 1);
						});

						if (app.data) {
							dispatch.apply("filterChanged");
						} else {
							const iDataLoadInterval = setInterval(() => {
								if (app.data) {
									clearInterval(iDataLoadInterval);
									dispatch.apply("filterChanged");
								}
							}, 100);
						}
					},
					beforeLeave(data) {
						// console.log( 'SPA.js -> leaving index' );
						dispatch.on("filterChanged.compensation", null);
					},
				},

				// CONFIG
				{
					namespace: "commutation",
					beforeEnter(data) {},
					afterEnter(data) {
						document.querySelector( '[data-page="commutation"]' ).classList.add( 'active' );

						renderCurrencyFilter("select[data-metric=currency]");

						// Render Graph
						dispatch.on("filterChanged.commutation", (oPayload) => {
							setTimeout(() => {
								const aData = JSON.parse(JSON.stringify(app.data));

								const aFilterdData = addMapStyleProperties(applyFiltersOnData(getFilters(), aData));

								console.log("filterChanged.commutation", oPayload, aFilterdData);

								if (!app.bMapRendered) {
									app.bMapRendered = true;
									app.commutation();
								} else {

									const map = app.map;

									// ui related filters
									if ([ "commute" , ].includes(Object.keys(oPayload)[0])) {
										if (oPayload.commute) {
											map.setLayoutProperty("arcs-layer", "visibility", oPayload.commute);
										}
									} else {

										// add participants data as a source to map
										map.getSource("participants-source")
											.setData(getGeoJSONPointDataset(aFilterdData));

										// add office locations data as a source
										map.getSource("office-source")
											.setData(getGeoJSONPointDataset(getUniqueOfficeLocations(aFilterdData)));

										// add office-to-residence arcs data as a source
										map.getSource("arcs-source")
											.setData(getGeoJSONArcDataset(getOfficeToResidenceArcsDataset(aFilterdData)));
									}
								}

							}, 1);
						});

						if (app.data) {
							dispatch.apply("filterChanged");
						} else {
							const iDataLoadInterval = setInterval(() => {
								if (app.data) {
									clearInterval(iDataLoadInterval);
									dispatch.apply("filterChanged");
								}
							}, 100);
						}

					},
					beforeLeave(data) {
						dispatch.on("filterChanged.commutation", null);
					},
				},

				// ANALYZE
				{
					namespace: "correlation",
					beforeEnter(data) {},
					afterEnter(data) {
						document.querySelector( '[data-page="correlation"]' ).classList.add( 'active' );
					},
					beforeLeave(data) {},
				},
			],
			transitions: [
				{
					name: "page-transition",
					once(data) {
						// console.log( 'SPA.js -> first load', data.next.container.dataset.barbaNamespace );
					},

					leave(data) {
						document.querySelectorAll( 'ul.menu li').forEach( item => item.classList.remove( 'active') );
					},
					afterLeave(data) {},
					enter(data) {
						// console.log( 'barba: enter:', data.next.container.dataset.barbaNamespace );
					},
					afterEnter(data) {},
					after(data) {},
				},
			],
		});

		this.initEventListeners();
	}

	initEventListeners() {
		const dispatch = this.dispatch;

		// Bind listeners on filters
		d3.selectAll(".single-dropdown select").on("change", function (e) {
			const sMetric = this.getAttribute("data-metric"),
				sValue = this.value;
			console.log(sMetric, sValue);
			dispatch.apply("filterChanged", this, [ {[sMetric]: sValue,} , ]);
		});

		d3.selectAll(".checkbox input").on("change", function (e) {
			const sMetric = this.getAttribute("data-metric"),
				sValue = this.value;
			console.log(sMetric, sValue);
			dispatch.apply("filterChanged");
		});
	}

	compensation() {
		const aData = JSON.parse(JSON.stringify(this.data));
		const oFilters = getFilterValues();
		const aGroupedData = getGroupedData(
			aData,
			oFilters.primary,
			oFilters.secondary
		);
		const aQuantData = getQuantileData(
			aGroupedData,
			oFilters.calculate,
			Number(oFilters.currency),
			oFilters.adjust
		);
		const maxQuantBoundary = d3.max(aQuantData, (d) => d[2][3]);

		console.log("data", aQuantData[0], oFilters);

		// TODO: Truncate
		if (oFilters["truncate-results"]) {
		} else {
			renderCompensation(
				document.getElementById("compensation-graph"),
				aQuantData,
				maxQuantBoundary
			);
		}
	}

	commutation() {

		const map = this.map = new mapboxgl.Map({
			container: "commutation-map", // Specify the container ID
			style: "mapbox://styles/mapbox/dark-v10", // Specify which map style to use
			zoom: 1.34,
			center: [ 13.747157081573533, 7.254837457058102 , ],
		});

		map.on("load", () => {

			const dataset = addMapStyleProperties(JSON.parse(JSON.stringify(this.data)));

			// add participants data as a source to map
			map.addSource("participants-source", {
				type: "geojson",
				data: getGeoJSONPointDataset(dataset),
				cluster: false,
				// Max zoom to cluster points on
				clusterMaxZoom: 13,
				// // Radius of each cluster when clustering points (defaults to 50)
				// clusterRadius: 50
			});

			// add office locations data as a source
			map.addSource("office-source", {
				type: "geojson",
				data: getGeoJSONPointDataset(getUniqueOfficeLocations(dataset)),
			});

			// add office-to-residence arcs data as a source
			map.addSource("arcs-source", {
				type: "geojson",
				data: getGeoJSONArcDataset(getOfficeToResidenceArcsDataset(dataset)),
			});

			// add office location layer
			map.addLayer({
				id: "office-layer",
				type: "circle",
				source: "office-source",
				//'source-layer': 'sf2010',
				paint: {
					// make circles larger as the user zooms from z12 to z22
					"circle-radius": {
						base: 5,
						stops: [
							[ 12, 5 , ],
							[ 22, 180 , ],
						],
					},
					// color circles by ethnicity, using a match expression
					// https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-match
					"circle-color": "yellow",
					"circle-opacity": 0.75,
				},
			});

			// add arcs layer
			map.addLayer({
				id: "arcs-layer",
				type: "line",
				source: "arcs-source",
				paint: {
					// // make circles larger as the user zooms from z12 to z22
					// 'circle-radius': {
					//     'base': 6,
					//     'stops': [
					//         [12, 6],
					//         [22, 10]
					//     ]
					// },
					// color circles by ethnicity, using a match expression
					// https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-match
					//'circle-color': "orange",
					"line-color": [
						"interpolate-hcl",
						[ "linear" , ],
						[ "number", [ "get", "calculated_compensation" , ] , ],
						40000,
						"#2DC4B2",
						60000,
						"#3BB3C3",
						80000,
						"#669EC4",
						100000,
						"#8B88B6",
						140000,
						"#A2719B",
						180000,
						"#AA5E79",
					],
					"line-opacity": 0.75,
					"line-width": [
						"interpolate",
						[ "linear" , ],
						[ "number", [ "get", "calculated_compensation" , ] , ],
						40000,
						0.05,
						60000,
						0.25,
						80000,
						0.5,
						100000,
						1,
						140000,
						2.5,
						160000,
						3.5,
						180000,
						5,
					],
				},
			});

			// add participants layer
			map.addLayer({
				id: "participants-layer",
				type: "circle",
				source: "participants-source",
				//'source-layer': 'sf2010',
				paint: {
					// make circles larger as the user zooms from z12 to z22
					"circle-radius": {
						base: 6,
						stops: [
							[ 12, 6 , ],
							[ 22, 10 , ],
						],
					},
					// color circles by ethnicity, using a match expression
					// https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-match
					//'circle-color': "orange",
					"circle-color": [
						"interpolate-hcl",
						[ "linear" , ],
						[ "number", [ "get", "calculated_compensation" , ] , ],
						40000,
						"#2DC4B2",
						60000,
						"#3BB3C3",
						80000,
						"#669EC4",
						100000,
						"#8B88B6",
						140000,
						"#A2719B",
						180000,
						"#AA5E79",
					],
					"circle-stroke-width": 1,
					"circle-stroke-color": [
						"case",
						[ "boolean", [ "get", "is_office_same_city" , ] , ],
						"yellow",
						"transparent",
					],
				},
			});

			map.on('mouseenter', 'participants-layer', function () {
				// map.getCanvas().style.cursor = 'pointer';
			});
			map.on('mouseleave', 'participants-layer', function () {
				// map.getCanvas().style.cursor = '';
			});
		});
	}
}

const app = new App();
document.addEventListener("DOMContentLoaded", app.init());
